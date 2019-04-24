

var protocolVersion = 2;

var providerAttrValue = {
  value: "scripts/node_group__converge.rb",
  datatype: "string",
  hidden: false
}

var providerAttributes = [{
  key: "entrypoint",
  attributeValue: providerAttrValue
}];

var instanceAttributes = [{
  key: "system.service_instance_name",
  attributeValue: {
    value: "test1-kube-nodes",
    datatype: "string",
    hidden: false
  }
}];

var attributes = {
  provider: providerAttributes,
  instance: instanceAttributes
};

var executionEnvironment = {
  type: "ephemeral_container",
  docker_file: ""
};

var ruby_handler = {
  entrypoint: 'scripts/node_group__converge.rb'
}

var ruby_handler_buffer = Buffer.from(JSON.stringify(ruby_handler));
var environment_buffer = Buffer.from(JSON.stringify(executionEnvironment));

var ruby_action_1 = {
  protocolVersion: protocolVersion,
  taskId: 1,
  topTaskId: 0,
  lang: 'ruby',
  handlerBuffer: ruby_handler_buffer,
  environmentBuffer: environment_buffer,
  componentInstance: "component_instance_1",
  attributes: attributes,
  userPublicKey: "key",
  debugPortRequest: 0,
  retryInfo: 1,
  timeoutInfo: 1,
  type: "EXECUTABLE",
  method: "METHOD"
};

var ruby_action_2 = {...ruby_action_1};
ruby_action_2.taskId = 3;

var ruby_action_3 = {...ruby_action_1};
ruby_action_3.taskId = 5;
ruby_action_3.topTaskId = 2;

var bash_handler = {
  command: "kubectl create -f https://k8s.io/examples/admin/namespace-dev.json"
};

var bash_handler_buffer = Buffer.from(JSON.stringify(bash_handler));

var bash_action = {
  protocolVersion: protocolVersion,
  taskId: 4,
  topTaskId: 2,
  lang: 'bash',
  handlerBuffer: bash_handler_buffer,
  environmentBuffer: environment_buffer,
  componentInstance: "component_instance_1",
  attributes: attributes,
  userPublicKey: "key",
  debugPortRequest: 0,
  retryInfo: 1,
  timeoutInfo: 1,
  type: "EXECUTABLE",
  method: "METHOD"
};


// TODO Vedad: Puppet
// var puppet_handler = {
//   manifests: "manifests"
// }

// var puppet_handler_buffer = Buffer.from(JSON.stringify(puppet_handler));

// var puppet_action = {
//   protocolVersion: protocolVersion,
//   taskId: 5,
//   topTaskId: -1, //is not assigned to an action
//   lang: Utils.LANG.PUPPET,
//   handlerBuffer: puppet_handler_buffer,
//   environmentBuffer: environment_buffer,
//   componentInstance: "component_instance_1",
//   attributes: attributes,
//   userPublicKey: "key",
//   debugPortRequest: 0,
//   retryInfo: 1,
//   timeoutInfo: 1,
//   type: "EXECUTABLE",
//   method: "METHOD"
// }

var ruby_action_4 = {...ruby_action_3};
ruby_action_4.topTaskId = 20;
ruby_action_4.taskId = 19;

var executable_actions_3 = Buffer.from(JSON.stringify([ruby_action_4]));

var decomposition_2 = {
  temporalRelationship: 'SEQUENTIAL',
  nestedActions: executable_actions_3
};

var abstract_action_2 = {
  taskId: 20,
  name: "MOD::COMP[TITLE].METHOD_3",
  type: "ABSTRACT",
  description: "Abstract action in abstract action",
  retryCount: 1,
  retryDelaySeconds: 1,
  decomposition: decomposition_2,
  schemaVersion: 2,
  topTaskId: 2
};

var executable_actions_2 = Buffer.from(JSON.stringify([/*bash_action, */ruby_action_3, abstract_action_2]));

var decomposition = {
  temporalRelationship: 'SEQUENTIAL',
  nestedActions: executable_actions_2
};

var abstract_action = {
  taskId: 2,
  name: "MOD::COMP[TITLE].METHOD_2",
  type: "ABSTRACT",
  description: "Abstract action in abstract action",
  retryCount: 1,
  retryDelaySeconds: 1,
  decomposition: decomposition,
  schemaVersion: 2,
  topTaskId: 0
}

module.exports = [ruby_action_1, abstract_action, ruby_action_2];
//module.exports = executable_actions = [bash_action];