var PROTO_PATH = "received_message.proto";
var received_message = require("./received_message");
var grpc = require("grpc");
var protoLoader = require("@grpc/proto-loader");
var grpc_promise = require("grpc-promise");
const envConfig = require("./config/grpc");

var packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: false,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});
var received_message_proto = grpc.loadPackageDefinition(packageDefinition)
  .pckg_received_message;

async function main() {
  var client = new received_message_proto.ActionRequest(
    envConfig.grpc.clientAddress + ":" + envConfig.grpc.clientPort,
    grpc.credentials.createInsecure()
  );
  grpc_promise.promisifyAll(client, { timeout_message: 6000 });
  const send = client.sendAction();
  console.log("Sending: ", received_message);
  try {
    const res = await send.sendMessage(received_message);
  } catch (err) {
    console.log(err);
  }
}

main();
