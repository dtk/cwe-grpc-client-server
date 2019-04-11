# cwe-grpc-client-server

Consists of two parts:
1. GRPC client that sends data to controller workflow executor.
2. GRPC server that receives messages and sends results back.

## Steps to execute

```
npm install
```

1. Execute server:
```
node server.js
```
2. Execute controller workflow executor `start.ts` script
3. Execute grpc client script:
```
npm start
```
