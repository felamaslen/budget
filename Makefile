NAME 	:= docker.fela.space/budget
TAG 	:= $$(git log -1 --pretty=%H)
IMG 	:= ${NAME}:${TAG}

build:
	docker build -t docker.fela.space/budget_base:latest .
	docker build -f prod.Dockerfile -t ${IMG} .

build_linux_amd64:
	docker build --platform linux/amd64 -t docker.fela.space/budget_base:latest .
	docker build --platform linux/amd64 -f prod.Dockerfile -t ${IMG} .

push:
	docker push ${IMG}

get_image:
	@echo ${IMG}
