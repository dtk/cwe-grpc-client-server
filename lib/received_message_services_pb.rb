# Generated by the protocol buffer compiler.  DO NOT EDIT!
# Source: received_message.proto for package 'pckg_received_message'

require 'grpc'
require 'received_message_pb'

module PckgReceivedMessage
  module ActionRequest
    class Service

      include GRPC::GenericService

      self.marshal_class_method = :encode
      self.unmarshal_class_method = :decode
      self.service_name = 'pckg_received_message.ActionRequest'

      rpc :SendAction, ReceivedMessage, RequestAck
      rpc :CancelAction, CancelMessage, RequestAck
    end

    Stub = Service.rpc_stub_class
  end
end
