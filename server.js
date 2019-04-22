var PROTO_PATH = 'executable_action.proto';
var exec = require('child_process').exec, child;
var k8s = require('@kubernetes/client-node');

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
const delay = 2000;

function sleep(ms) {
  console.log("Waiting", ms/1000, "s")
  return new Promise(resolve => setTimeout(resolve, ms));
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
  console.log('Server: Stream Message Received = ', call.request);
  if(call.request.lang === 'bash'){
    const handler = JSON.parse(call.request.handlerBuffer);
    await sleep(4000);
    console.log("Executing:", handler.command);
    const res = await exec(handler.command);
    const kc = new k8s.KubeConfig();
    kc.loadFromDefault();
    const watch = new k8s.Watch(kc);
    const req = watch.watch('/api/v1/namespaces', {}, async (type, obj) => {
      console.log(type);
      if(type === 'DELETED'){
        console.log("Job finished, aborting watch");
        req.abort();
        callback(null, { taskId: call.request.taskId, message: 'Delete success' });
      }
      else if(type === 'ADDED' && obj.metadata.name === 'development'){
        console.log(obj);
        console.log("Object '", obj.metadata.name, "' created. Deleting...");
        await exec('kubectl delete namespace development');
      }
    }, (err) => { console.log(err); });
  }
  else{
    await sleep(delay);
    callback(null, { taskId: call.request.taskId, message: 'Execution success' });
  }
  
}
/**
 * Starts an RPC server that receives requests for the Greeter service at the
 * sample server port
 */
function main() {
  var server = new grpc.Server();
  server.addService(executable_action_proto.ActionRequest.service, { reqReceived: reqReceived, streamAction: streamAction, ping: ping});
  server.bind('0.0.0.0:' + port, grpc.ServerCredentials.createInsecure());
  server.start();
  console.log("server started: ", server);
}

main();