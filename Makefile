NAME 	:= docker.fela.space/budget
TAG 	:= $$(git log -1 --pretty=%H)
IMG 	:= ${NAME}:${TAG}

build:
	docker build -t docker.fela.space/budget_base:latest .
	docker build -f prod.Dockerfile -t ${IMG} .

push:
	docker push ${IMG}

get_image:
	@echo ${IMG}
