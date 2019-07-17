require("dotenv").config();
var PROTO_PATH = "action_invocation_message.proto";
const Client = require("kubernetes-client").Client;
const K8sConfig = require("kubernetes-client").config;
const config = eval(`K8sConfig.${process.env.KUBE_CONFIG_METHOD}`);
const client = new Client({ config: config, version: "1.9" });
const envConfig = require("./config/grpc");
const dateformat = require("dateformat");

const DATE_FORMAT = "yyyy-mm-dd HH:MM:ss:l";

const formatDate = date => {
  return dateformat(date, DATE_FORMAT);
};

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
getOK = dateTime => {
  return {
    errorMessage: "",
    status: "OK",
    actionStartTimestamp: dateTime
  };
};

getNOTOK = () => {
  return {
    errorMessage: "Error",
    status: "NOTOK"
  };
};

function sleep(ms) {
  console.log("Waiting", ms / 1000, "s");
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function pushCrd(namespace, name, step, startedAt) {
  let crdObject = await client.apis["dtk.io"].v1alpha1
    .namespace(namespace)
    .actions(name)
    .get();
  crdObject.body.spec.status.steps.push({
    id: step,
    state: "EXECUTING",
    startedAt: startedAt
  });
  await client.apis["dtk.io"].v1alpha1
    .namespace(namespace)
    .actions(name)
    .put(crdObject);
}

async function updateCrd(namespace, name, state, message, step, startedAt) {
  crdObject = await client.apis["dtk.io"].v1alpha1
    .namespace(namespace)
    .actions(name)
    .get();
  const index = crdObject.body.spec.status.steps.findIndex(element => {
    return element.id === step && element.startedAt === startedAt;
  });
  crdObject.body.spec.status.steps[index].state = state;
  if (message) crdObject.body.spec.status.steps[index].errorMessage = message;
  crdObject.body.spec.status.steps[index].finishedAt = formatDate(new Date());
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
  const startedAt = formatDate(new Date());

  //change result property to trigger OK or NOTOK
  const result = step === "2.1.1" ? getNOTOK(startedAt) : getOK(startedAt);
  console.log("SENDING OK/NOTOK: ", result);

  if (result.status === "NOTOK") {
    for (let i = 1; i <= 10; i++) {
      try {
        await pushCrd(namespace, name, step, startedAt);
        await updateCrd(
          namespace,
          name,
          "FAILURE",
          result.errorMessage,
          step,
          startedAt
        );
        callback(null, result);
        return;
      } catch (err) {
        console.log("Retrying... " + i + "/10");
      }
    }
  }
  callback(null, result);

  try {
    console.log("Pushing...");
    for (let i = 1; i <= 10; i++) {
      try {
        console.log("Trying to push action ", step);
        await pushCrd(namespace, name, step, startedAt);
        break;
      } catch (err) {
        console.log("Retrying... " + i + "/10");
      }
    }
    console.log("[ KUBE ] Updated action " + step + " to executing in crd");
    await sleep(3000);
    console.log("Updating...");
    await updateCrd(namespace, name, "SUCCESS", null, step, startedAt);
    console.log("[ KUBE ] Updated action " + step + " to finished in crd");
  } catch (error) {
    await updateCrd(namespace, name, "FAILURE", "Error", step, startedAt);
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
