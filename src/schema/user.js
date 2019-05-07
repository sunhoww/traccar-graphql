import { AuthenticationError } from 'apollo-server';

import { createToken, getSid } from '../auth';

export const typeDef = `
  extend type Query {
    me: User
  }

  extend type Mutation {
    signIn(email: String!, password: String!): SignInResponse
    signOut: Boolean
  }

  type User {
    id: Int!
    email: String
    name: String
  }

  type SignInResponse {
    token: String
    user: User
  }
`;

export const resolvers = {
  Query: {
    me: (_, __, { dataSources }) => {
      return dataSources.traccar.getSession();
    },
  },
  Mutation: {
    signIn: async (_, args, { dataSources }) => {
      const { cookie, ...user } = await dataSources.traccar.createSession(args);
      const sid = getSid(cookie);
      if (sid) {
        return { token: createToken({ id: user.id, email: user.email, sid }), user };
      }
    },
    signOut: (_, __, { dataSources }) => {
      return dataSources.traccar.deleteSession();
    },
  },
};
