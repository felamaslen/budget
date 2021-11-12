NAME 	:= docker.fela.space/budget
TAG 	:= $$(git log -1 --pretty=%H)
IMG 	:= ${NAME}:${TAG}

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

generate_coverage: export COVERAGE = true
generate_coverage:
	@yarn test:api:unit
	@yarn test:api:integration
	@yarn test:client
	@yarn coverage
