cursor = {
  index: "-1",
  position: "after"
};

//module.exports = received_message = {
//  name: "create-component-group-test1",
//  namespace: "test",
//  cursor
//};

module.exports = received_message = {
  name: "create-subnet-security-group",
  namespace: "default",
  cursor
};

// ./grpcurl -plaintext -proto received_message.proto -d '{"name": "create-component-group-test1","namespace": "test","cursor": {"index": "-1","position": "after"}}'
