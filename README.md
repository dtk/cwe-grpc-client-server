# cwe-grpc-client-server

Consists of two parts:
1. GRPC client that sends data to controller workflow executor which triggers execution (primitive version of controller manager)
2. GRPC server that receives executable action messages and sends results back to workflow executor (primitive stub remote executor).

## Setup

1. After cloning do:
```
npm install
```
2. Change the [following client config properties](https://github.com/dtk/cwe-grpc-client-server/blob/master/config/grpc.js#L3-L4) to match the ones in [workflow executor server config properties](https://github.com/dtk/controller-workflow-executor/blob/master/config/grpc.ts#L2-L3).

3. Create .env file and populate it according to info provided in example.env

4. Execute server:
```
node server.js
```

## Execution

After completing setup section of [workflow executor](https://github.com/dtk/controller-workflow-executor/#local-setup), in new terminal instance in directory of this repo do:
```
npm run send
```

Continue by following execution section in [workflow executor](https://github.com/dtk/controller-workflow-executor/#execution)