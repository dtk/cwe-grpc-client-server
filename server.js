var PROTO_PATH = 'executable_action.proto';
var exec = require('child_process').exec, child;
var k8s = require('@kubernetes/client-node');
const Client = require('kubernetes-client').Client
const K8sConfig = require('kubernetes-client').config
const config = K8sConfig.fromKubeconfig()
const client = new Client({ config: config, version: '1.9' })

const testNamespace = require('./test_namespace.json')

var grpc = require('grpc');
var protoLoader = require('@grpc/proto-loader');
const port = '8082'
var packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: false,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });
var executable_action_proto = grpc.loadPackageDefinition(packageDefinition).pckg_executable_action;
const delay = 4000;
let cancelled = false;

function sleep(ms) {
  console.log("Waiting", ms/1000, "s")
  return new Promise(resolve => setTimeout(resolve, ms));
}

function testStreamStream(call) {
  call.on('data', function (message) {
    console.log('Server: Stream Message Received = ', message); // Server: Stream Message Received = {id: 1}
      call.write({
        id: message.id // IMPORTANT only for Bidirectional Stream Request
      });
  });
 
  call.on('end', function () {
    call.end();
  });
}

function reqReceived(call, callback) {
  const receivedMessage = call.request;
  console.log(receivedMessage);
  const reqAck = {
    taskId: receivedMessage.taskId,
    message: 'Server received the message'
  }
  callback(null, reqAck);
}

async function ping(call, callback) {
  console.log("Ping received");
  callback(null, { taskId: call.request.taskId, message: "Pong"})
}

async function streamAction(call, callback) {
  cancelled = false;
  console.log('Server: Stream Message Received = ', call.request);
  await sleep(4000);
  try {
    const create = await client.api.v1.namespaces.post({body: testNamespace});
    console.log(create);
    deleteNamespace = await client.api.v1.namespaces("test").delete();
    console.log(deleteNamespace);
  }
  catch(error) {
    callback(null, { taskId: call.request.taskId, message: 'Execution success, but error: ' + error, status: 'DONE' });
    //callback(null, { taskId: call.request.taskId, message: error, status: 'ERROR' });
  }
  callback(null, { taskId: call.request.taskId, message: 'Execution success', status: 'DONE' });
}

// async function streamAction(call, callback) {
//   console.log('Server: Stream Message Received = ', call.request);
//   cancelled = false;
//   if(call.request.lang === 'bash'){
//     const handler = JSON.parse(call.request.handlerBuffer);
//     await sleep(4000);
//     console.log("Executing:", handler.command);
//     const res = await exec(handler.command);
//     const kc = new k8s.KubeConfig();
//     kc.loadFromDefault();
//     const watch = new k8s.Watch(kc);
//     const req = watch.watch('/api/v1/namespaces', {}, async (type, obj) => {
//       console.log(type);
//       if(type === 'DELETED'){
//         console.log("Job finished, aborting watch");
//         req.abort();
//         callback(null, { taskId: call.request.taskId, message: 'Delete success' });
//       }
//       else if(type === 'ADDED' && obj.metadata.name === 'development'){
//         console.log(obj);
//         console.log("Object '", obj.metadata.name, "' created. Deleting...");
//         await exec('kubectl delete namespace development');
//       }
//     }, (err) => { console.log(err); });
//   }
//   else{
//     await sleep(delay);
//     if(!cancelled) callback(null, { taskId: call.request.taskId, message: 'Execution success' });
//     else callback(null, { taskId: call.request.taskId, message: 'Cancelled' });
//   }
  
// }

async function CancelActionRemote(call, callback) {
  cancelled = true;
  console.log(call.request);
  callback(null, { taskId: call.request.taskId, message: 'Cancel received and updated'});
}

function main() {
  var server = new grpc.Server();
  server.addService(executable_action_proto.ActionRequest.service, { CancelActionRemote: CancelActionRemote, reqReceived: reqReceived, streamAction: streamAction, ping: ping, testStreamStream: testStreamStream });
  server.bind('0.0.0.0:' + port, grpc.ServerCredentials.createInsecure());
  server.start();
  console.log("server started: ", server);
}

main();