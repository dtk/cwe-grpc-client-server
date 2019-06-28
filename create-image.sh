docker build -t fvedo1/stub-remote-executor .
docker push fvedo1/stub-remote-executor

kubectl apply -f stub-service.yaml
kubectl apply -f stub-deployment.yaml