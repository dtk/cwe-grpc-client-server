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
2. Execute controller workflow executor `start.ts` script; in controller workflow executor directory:
```
npm start
```
- If there is a port problem, the ports need to be changed in `server.js` and `cwe-stub-client.js`, and in `start.ts` of controller workflow executor
3. After controller workflow executor server successfully starts, execute grpc client script; in cwe-grpc-client-server directory:
```
npm start
```
