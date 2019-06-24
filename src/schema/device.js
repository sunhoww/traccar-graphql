import { gql } from 'apollo-server';

export const typeDef = gql`
  extend type Query {
    devices: [Device]!
    device(id: ID): Device
  }

  extend type User {
    devices: [Device]!
  }

  type Device {
    id: ID!
    name: String
    uniqueId: String
    status: DeviceStatus
  }

  enum DeviceStatus {
    ONLINE
    OFFLINE
    UNKNOWN
  }
`;

export const resolvers = {
  Query: {
    devices: (_, __, { dataSources }) => {
      return dataSources.traccar.getDevices();
    },
    device: (_, { id }, { dataSources }) => {
      return dataSources.traccar.getDeviceById(id);
    },
  },
  User: {
    devices: ({ id }, _, { dataSources }) => {
      return dataSources.traccar.getDevicesByUserId(id);
    },
  },
};
