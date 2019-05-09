var PROTO_PATH = 'received_message.proto';
var cancel_message = require('./cancel_message');
var grpc = require('grpc');
var protoLoader = require('@grpc/proto-loader')
var grpc_promise = require('grpc-promise');

var packageDefinition = protoLoader.loadSync(
  PROTO_PATH,
  {
    keepCase: false,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  }
)
var received_message_proto = grpc.loadPackageDefinition(packageDefinition).pckg_received_message;

async function main() {
  var client = new received_message_proto.ActionRequest('0.0.0.0:8083', grpc.credentials.createInsecure());
  grpc_promise.promisifyAll(client, { timeout_message: 6000 });
  const send = client.cancelAction();
  console.log("Sending cancel action with id:", cancel_message.taskId, "to cwe");
  try{
    const res = await send.sendMessage(cancel_message);
  }
  catch(err) {
    console.log(err);
  }
}

main();