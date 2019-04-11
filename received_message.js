var executable_actions = require('./executable_actions');

let executable_actions_buff = Buffer.from(JSON.stringify(executable_actions));

var decomposition = {
  temporalRelationship: 'SEQUENTIAL',
  nestedActions: executable_actions_buff
};

var abstract_action = {
  taskId: 0,
  name: "MOD::COMP[TITLE].METHOD",
  type: "ABSTRACT",
  description: "Encodes a file and deploys to CDN",
  retryCount: 1,
  retryDelaySeconds: 1,
  decomposition: decomposition,
  schemaVersion: 2,
  topTaskId: -1
};

module.exports = received_message = {
  type: 'ABSTRACT',
  abstractAction: abstract_action
};