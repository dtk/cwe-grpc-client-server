var PROTO_PATH = 'executable_action.proto';

var grpc = require('grpc');
var protoLoader = require('@grpc/proto-loader');
var packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: false,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });
var executable_action_protot = grpc.loadPackageDefinition(packageDefinition).pckg_executable_action;

function sleep(ms) {
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

function streamAction(call) {
  call.on('data', async function (message) {
    console.log('Server: Stream Message Received = ', message); // Server: Stream Message Received = {id: 1}
    setTimeout(function () {
      call.write({
        task_id: message.taskId,
        id: message.id,
        message: "[SUCCESS]"
      })
    }, 2000)
  });

  call.on('end', function() {
    call.end();
  })
}

/**
 * Starts an RPC server that receives requests for the Greeter service at the
 * sample server port
 */
function main() {
  var server = new grpc.Server();
  server.addService(executable_action_protot.ActionRequest.service, { reqReceived: reqReceived, streamAction: streamAction });
  server.bind('0.0.0.0:8082', grpc.ServerCredentials.createInsecure());
  server.start();
  console.log("server started: ", server);
}

main();