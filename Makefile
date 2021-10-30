NAME 	:= docker.fela.space/budget
TAG 	:= $$(git log -1 --pretty=%H)
IMG 	:= ${NAME}:${TAG}
IMG_VISUAL := ${NAME}_visual:latest

build:
	docker build -t ${IMG} .
	docker tag ${IMG} ${NAME}:latest

build_linux_amd64:
	docker build --platform linux/amd64 -t ${IMG} .
	docker tag ${IMG} docker.fela.space/budget:latest

push:
	docker push ${IMG}

get_image:
	@echo ${IMG}

build_visual:
	docker build -t ${IMG_VISUAL} -f visual.Dockerfile .

get_image_visual:
	@echo ${IMG_VISUAL}

generate_coverage: export COVERAGE = true
generate_coverage:
	@yarn test:api:unit
	@yarn test:api:integration
	@yarn test:client
	@yarn coverage
