require("dotenv").config();
var PROTO_PATH = "action_invocation_message.proto";
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
var action_invocation_proto = grpc.loadPackageDefinition(packageDefinition)
  .pckg_action_invocation_message;

const template = require("./template_crd.json");
const OK = {
  errorMessage: "",
  status: "OK"
};
const NOTOK = {
  errorMessage: "Error",
  status: "NOTOK"
};

function sleep(ms) {
  console.log("Waiting", ms / 1000, "s");
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function pushCrd(namespace, name, step) {
  let crdObject = await client.apis["dtk.io"].v1alpha1
    .namespace(namespace)
    .actions(name)
    .get();
  crdObject.body.spec.status.steps.push({
    id: step,
    state: "EXECUTING",
    startedAt: new Date()
  });
  const update = await client.apis["dtk.io"].v1alpha1
    .namespace(namespace)
    .actions(name)
    .put(crdObject);
}

async function updateCrd(namespace, name, state, message, step) {
  crdObject = await client.apis["dtk.io"].v1alpha1
    .namespace(namespace)
    .actions(name)
    .get();
  const index = crdObject.body.spec.status.steps.findIndex(element => {
    return element.id == step;
  });
  crdObject.body.spec.status.steps[index].state = state;
  if (message) crdObject.body.spec.status.steps[index].errorMessage = message;
  crdObject.body.spec.status.steps[index].finishedAt = new Date();
  await client.apis["dtk.io"].v1alpha1
    .namespace(namespace)
    .actions(name)
    .put(crdObject);
}

async function reqReceived(call, callback) {
  cancelled = false;
  client.addCustomResourceDefinition(template);
  console.log("Server: message Received = ", call.request);
  const { actionCrdObject, step } = call.request;

  const [namespace, name] = actionCrdObject.split("/");

  //change result property to trigger OK or NOTOK
  const result = OK;

  callback(null, result);
  if (result.status === "NOTOK") {
    await pushCrd(namespace, name, step);
    return await updateCrd(
      namespace,
      name,
      "FAILURE",
      result.errorMessage,
      step
    );
  }

  try {
    await pushCrd(namespace, name, step);
    console.log("[ KUBE ] Updated action " + step + " to executing in crd");
    await sleep(3000);
    await updateCrd(namespace, name, "SUCCESS", null, step);
    console.log("[ KUBE ] Updated action " + step + " to finished in crd");
  } catch (error) {
    await updateCrd(namespace, name, "FAILURE", "Error", step);
  }
}

async function cancelAction(call, callback) {
  console.log("Cancel received");
  callback(null, {
    taskId: call.request.taskId,
    message: "Cancel received and updated"
  });
}

function main() {
  var server = new grpc.Server();
  server.addService(action_invocation_proto.ActionRequest.service, {
    reqReceived: reqReceived,
    cancelAction: cancelAction
  });
  server.bind(
    envConfig.grpc.serverAddress + ":" + envConfig.grpc.serverPort,
    grpc.ServerCredentials.createInsecure()
  );
  server.start();
  console.log("server started: ", server);
}

main();
