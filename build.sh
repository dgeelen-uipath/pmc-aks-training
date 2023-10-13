#!/bin/bash -e

TAG=pmcakstraining.azurecr.io/simon_daniel/todo:0.0.9

#az login

az acr login -n pmcakstraining
 
docker build . -t ${TAG}

docker push ${TAG}
