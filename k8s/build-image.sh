cd $(dirname "$0")

image=$(./get_new_tag.sh)

echo "Building image: $image"

cd .. && docker build -t $image .

exit 0
