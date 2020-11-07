cd $(dirname "$0")

version=$(cat ../package.json | jq -r .version)

image="docker.fela.space/budget:$version"

echo $image

exit 0
