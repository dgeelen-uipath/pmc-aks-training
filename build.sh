#!/bin/bash -e

TAG=pmcakstraining.azurecr.io/simon_daniel/todo:0.0.18
TAGFE=pmcakstraining.azurecr.io/simon_daniel/todo-fe:0.0.16

#az login

#az acr login -n pmcakstraining
 
docker build server -t ${TAG}

docker push ${TAG}

docker build client -t ${TAGFE}
docker push ${TAGFE}