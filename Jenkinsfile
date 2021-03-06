node {
  checkout scm
  result = sh(script: "git log -1 | grep '(wip)'", returnStatus: true)

  if (result == 0) {
    echo "Skipping commit"
  } else {
    script {
      IMAGE = sh(returnStdout: true, script: "make get_image").trim()
    }

    stage('Build and push image') {
      script {
        docker.withRegistry('https://docker.fela.space', 'docker.fela.space-registry') {
          sh 'rm -rf node_modules'
          sh 'make build_linux_amd64 push'
        }
      }
    }

    docker.withRegistry('https://docker.fela.space', 'docker.fela.space-registry') {
      docker.image('postgres:10-alpine').withRun('-e POSTGRES_USER=docker -e POSTGRES_PASSWORD=docker') { pg ->

        docker.image('postgres:10-alpine').inside("--link ${pg.id}:db") {
          sh 'while ! psql postgres://docker:docker@db/postgres -c "select 1" > /dev/null 2>&1; do sleep 1; done'

          sh 'psql postgres://docker:docker@db/postgres -c "create database budget_test;"'
        }

        stage('Lint') {
          sh "docker run --rm ${IMAGE} sh -c 'yarn lint && yarn prettier'"
        }

        stage('Client unit tests') {
          sh "docker run --rm ${IMAGE} sh -c 'yarn test:client:ci'"
        }

        stage('API unit tests') {
          sh "docker run --rm ${IMAGE} sh -c 'yarn test:api:unit:ci'"
        }

        stage('API integration tests') {
          sh "docker run --rm --link ${pg.id}:db -e 'DATABASE_URL_TEST=postgres://docker:docker@db/budget_test' ${IMAGE} sh -c 'yarn test:api:integration'"
        }
      }
    }

    stage('Deploy') {
      if (env.BRANCH_NAME == "master") {
        sh './k8s/migrate.sh'
        sh './k8s/deploy.sh'
      }
    }
  }
}
