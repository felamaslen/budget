#!/bin/bash

# This script should be run in a Debian/Ubuntu environment

POSTGRES_USER=budget
POSTGRES_PASSWORD=7b232b1av9a23vb8

DEFAULT_PIN=${DEFAULT_PIN:-1234}
BIRTH_DATE=${BIRTH_DATE:-1990-01-01}
USER_HASH_SALT=${USER_HASH_SALT:-somesecretsalt}

USER_TOKEN_SECRET=${USER_TOKEN_SECRET:-somesupersecrettoken}

OPEN_EXCHANGE_RATES_API_KEY=${OPEN_EXCHANGE_RATES_API_KEY:-your_api_key}
STOCKS_API_KEY=${STOCKS_API_KEY:-your_api_key}
ALPHAVANTAGE_API_KEY=${ALPHAVANTAGE_API_KEY:-your_api_key}

NETWORK_CIDR=10.11.0.0/16

set -e

function setup_cluster_dependencies {
  echo "Setting up cluster dependencies..."

  if [[ -z $(lsmod | grep br_netfilter) ]]; then
    echo "Enabling br_netfilter"
    sudo modprobe br_netfilter
  else
    echo "br_netfilter already loaded"
  fi

  echo "Enabling nf-call"
  cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
  net.bridge.bridge-nf-call-ip6tables = 1
  net.bridge.bridge-nf-call-iptables = 1
EOF

  sudo sysctl --system

  echo "Please open port 6443 (TCP) manually if it isn't already"

  echo "Installing dependencies"

  curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add
  echo "deb http://apt.kubernetes.io/ kubernetes-xenial main" | sudo tee /etc/apt/sources.list.d/kubernetes.list

  sudo apt update && sudo apt -y install \
    jq \
    docker-ce \
    docker-ce-cli \
    containerd.io \
    kubelet \
    kubeadm \
    kubectl

  echo "Holding kubelet, kubeadm and kubectl versions"
  sudo apt-mark hold kubelet kubeadm kubectl

  echo "Setting cgroupdriver to systemd"
  cat <<EOF | sudo tee /etc/docker/daemon.json
{
  "exec-opts": ["native.cgroupdriver=systemd"],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m"
  },
  "storage-driver": "overlay2"
}
EOF

  sudo systemctl daemon-reload
  sudo systemctl enable kubelet
  sudo systemctl restart kubelet

  sudo systemctl enable docker
  sudo systemctl restart docker

  echo "Disabling swap"
  sudo swapoff -a
}

function init_cluster {
  echo "Tearing down old cluster if it exists..."
  sudo kubeadm reset

  echo "Initiating new cluster..."
  sudo kubeadm init --pod-network-cidr=$NETWORK_CIDR

  echo "Copying kubernetes config"
  mkdir -p $HOME/.kube
  if [[ -f "$HOME/.kube/config" ]]; then
    echo "Backing up old config as $HOME/.kube/config.bak"
    mv $HOME/.kube/config $HOME/.kube/config.bak
  fi

  sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
  sudo chown $(id -u):$(id -g) $HOME/.kube/config
}

function init_network {
  echo "Initiating CIDR (network)..."
  kubectl apply -f https://docs.projectcalico.org/manifests/tigera-operator.yaml

  wget https://docs.projectcalico.org/manifests/custom-resources.yaml
  sed -i -E "s/cidr: .*/cidr: $(echo $NETWORK_CIDR | sed -e 's/\//\\\//g')/" custom-resources.yaml
  kubectl apply -f ./custom-resources.yaml
  rm -f custom-resources.yaml

  echo "Waiting for network pods to be ready..."

  calico_running=0

  while [[ $calico_running -ne 1 ]]; do
    status=$(kubectl get pods -n calico-system)
    [[ ! -z "$(echo "$status" | grep STATUS)" && \
      -z "$(echo "$status" | awk '{print $3}' | grep -v STATUS | grep -v Running)" ]] && calico_running=1

    if [[ $calico_running -ne 1 ]]; then
      echo "$status"
      sleep 5
    fi
  done

  echo "Network pods are all running"

  echo "Removing taints from master node"
  kubectl taint nodes --all node-role.kubernetes.io/master-

  nodes_ready=0

  while [[ $nodes_ready -ne 1 ]]; do
    nodes=$(kubectl get nodes -o wide)
    [[ -z "$(echo "$nodes" | awk '{print $2}' | grep -v STATUS | grep -v Ready)" ]] && nodes_ready=1

    if [[ $nodes_ready -eq 0 ]]; then
      echo "$nodes"
      sleep 5
    fi
  done

  echo "Nodes are all ready"
}

function setup_database_secret {
  echo "Creating database secret..."

  echo -n $POSTGRES_PASSWORD > password
  echo -n "postgres://$POSTGRES_USER:$POSTGRES_PASSWORD@budget-database:5432/budget" > url

  kubectl create secret generic postgres-pass --from-file=password --from-file=url

  rm -f password url
}

function setup_configmap {
  echo "Creating main configmap..."

  cat <<EOF > budget.env
PORT=80
ROARR_LOG=false
DEFAULT_PIN=$DEFAULT_PIN
DEFAULT_FUND_PERIOD=year5
BIRTH_DATE=$BIRTH_DATE
IP_BAN_TIME=300
IP_BAN_LIMIT=60
IP_BAN_TRIES=5
USER_HASH_SALT=$USER_HASH_SALT
USER_TOKEN_SECRET=$USER_TOKEN_SECRET
PIE_TOLERANCE=0.075
PIE_DETAIL=30
FUND_RESOLUTION=100
OPEN_EXCHANGE_RATES_API_KEY=$OPEN_EXCHANGE_RATES_API_KEY
STOCKS_API_KEY=$STOCKS_API_KEY
ALPHAVANTAGE_API_KEY=$ALPHAVANTAGE_API_KEY
DO_STOCKS_LIST=false
FAKE_STOCK_PRICES=false
STOCK_INDICES=""
SKIP_LOG_ACTIONS=""
EOF

  kubectl create configmap budget --from-env-file=./budget.env
  rm -f budget.env
}

function setup_container_registry {
  echo "Creating container registry secret..."

  docker login docker.fela.space

  kubectl create secret generic regcred \
    --from-file=.dockerconfigjson=$HOME/.docker/config.json \
    --type=kubernetes.io/dockerconfigjson
}

function setup_db {
  echo "Setting up database..."

  pod_ready=0
  pod_name=""
  while [[ $pod_ready -eq 0 ]]; do
    pod_line=$(kubectl get pods | grep budget-database)
    pod_status=$(echo "$pod_line" | awk '{print $3}')

    if [[ ! -z "$pod_line" && "$pod_status" -eq "Running" ]]; then
      echo "Pod running"
      pod_ready=1
      pod_name=$(echo "$pod_line" | awk '{print $1}')
    else 
      echo "$pod_line"
      echo "Pod not ready, waiting..."
      sleep 5
    fi
  done

  kubectl exec -it $pod_name -- psql -U budget -c "alter user budget with password '$POSTGRES_PASSWORD'"
}

function setup_ingress_controller {
  echo "Setting up nginx ingress controller..."

  kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v0.41.0/deploy/static/provider/baremetal/deploy.yaml

  kubectl get pods -n=ingress-nginx -l app.kubernetes.io/name=ingress-nginx

  node_port=$(kubectl -n=ingress-nginx get svc/ingress-nginx-controller -o=json \
    | jq '.spec.ports | map(select(.name == "http")) | .[0].nodePort')

  echo "Service available at http://localhost:$node_port"
}

function apply_manifest {
  echo "Applying manifest"

  sudo mkdir -p /var/local/budget-database

  kubectl apply -f ./manifest.yml

  kubectl get deployments -o wide
  kubectl get pods -o wide
}

setup_cluster_dependencies
init_cluster
init_network
setup_database_secret
setup_configmap
setup_container_registry
setup_db
setup_ingress_controller
apply_manifest

exit 0
