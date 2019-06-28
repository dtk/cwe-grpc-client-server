require("dotenv").config();
var PROTO_PATH = "executable_action.proto";
const Client = require("kubernetes-client").Client;
const K8sConfig = require("kubernetes-client").config;
const config = eval(`K8sConfig.${process.env.KUBE_CONFIG_METHOD}`);
const client = new Client({ config: config, version: "1.9" });
const envConfig = require("./config/grpc");

var grpc = require("grpc");
var protoLoader = require("@grpc/proto-loader");
var packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: false,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});
var executable_action_proto = grpc.loadPackageDefinition(packageDefinition)
  .pckg_executable_action;

const template = require("./template_crd.json");

function sleep(ms) {
  console.log("Waiting", ms / 1000, "s");
  return new Promise(resolve => setTimeout(resolve, ms));
}

function testStreamStream(call) {
  call.on("data", function(message) {
    console.log("Server: Stream Message Received = ", message); // Server: Stream Message Received = {id: 1}
    call.write({
      id: message.id // IMPORTANT only for Bidirectional Stream Request
    });
  });

  call.on("end", function() {
    call.end();
  });
}

function reqReceived(call, callback) {
  const receivedMessage = call.request;
  console.log(receivedMessage);
  const reqAck = {
    taskId: receivedMessage.taskId,
    message: "Server received the message"
  };
  callback(null, reqAck);
}

async function ping(call, callback) {
  console.log("Ping received");
  callback(null, { taskId: call.request.taskId, message: "Pong" });
}

async function streamAction(call, callback) {
  cancelled = false;
  const receivedMessage = require("./received_message");
  client.addCustomResourceDefinition(template);
  console.log("Server: Stream Message Received = ", call.request);
  const name = receivedMessage.name;
  const namespace = receivedMessage.namespace;
  callback(null, {
    taskId: call.request.taskId,
    message: "Message received",
    status: "received"
  });
  try {
    let crdObject = await client.apis["dtk.io"].v1alpha1
      .namespace(namespace)
      .actions(name)
      .get();
    console.log(crdObject);
    crdObject.body.spec.status.steps.push({
      id: call.request.actionId,
      state: "EXECUTING",
      startedAt: new Date()
    });
    let update = await client.apis["dtk.io"].v1alpha1
      .namespace(namespace)
      .actions(name)
      .put(crdObject);
    console.log("[ KUBE ] Updated action to executing in crd", update);
    await sleep(3000);

    crdObject = await client.apis["dtk.io"].v1alpha1
      .namespace(namespace)
      .actions(name)
      .get();
    const index = crdObject.body.spec.status.steps.findIndex(element => {
      return element.id == call.request.actionId;
    });
    crdObject.body.spec.status.steps[index].state = "SUCCESS";
    crdObject.body.spec.status.steps[index].finishedAt = new Date();
    update = await client.apis["dtk.io"].v1alpha1
      .namespace(namespace)
      .actions(name)
      .put(crdObject);
    console.log("[ KUBE ] Updated action to finished in crd", update);
  } catch (error) {
    callback(null, {
      taskId: call.request.taskId,
      message: "Execution success, but error: " + error,
      state: "DONE"
    });
    //callback(null, { taskId: call.request.taskId, message: error, status: 'ERROR' });
  }
}

async function CancelActionRemote(call, callback) {
  cancelled = true;
  console.log(call.request);
  callback(null, {
    taskId: call.request.taskId,
    message: "Cancel received and updated"
  });
}

function main() {
  var server = new grpc.Server();
  server.addService(executable_action_proto.ActionRequest.service, {
    CancelActionRemote: CancelActionRemote,
    reqReceived: reqReceived,
    streamAction: streamAction,
    ping: ping,
    testStreamStream: testStreamStream
  });
  server.bind(
    envConfig.grpc.serverAddress + ":" + envConfig.grpc.serverPort,
    grpc.ServerCredentials.createInsecure()
  );
  server.start();
  console.log("server started: ", server);
}

main();
