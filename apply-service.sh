kubectl apply -f stub-service.yaml
minikube service stub-remote-executor --url
echo "Add above address and port to controller workflow executor 'config/grpc.ts' client data"