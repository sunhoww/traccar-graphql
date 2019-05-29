// @flow

import { gql, AuthenticationError, UserInputError } from 'apollo-server';
import * as admin from 'firebase-admin';
import { pick } from 'lodash';

export const typeDef = gql`
  extend type Query {
    me: User
  }

  extend type Mutation {
    createSession: SignInResponse
    deleteSession: Boolean
  }

  type User {
    id: Int!
    email: String
    name: String
  }

  type SignInResponse {
    traccarSessionId: String
    user: User
  }
`;

function userReducer(user: Object) {
  return pick(user, ['id', 'email', 'name']);
}

function userGetter(dataSources: Object) {
  return async function(uid: string, email: string, name: string) {
    const doc = await dataSources.firestore.getUser(uid);
    if (doc) {
      return doc;
    }
    const traccarCred = require('crypto')
      .randomBytes(20)
      .toString('hex');
    const { id: traccarId } = await dataSources.traccar.createUser({
      email,
      name,
      password: traccarCred,
    });
    await dataSources.firestore.updateUser(uid, { traccarId, traccarCred });
    return { traccarId, traccarCred };
  };
}

export const resolvers = {
  Query: {
    me: async (_, __, { dataSources }) => {
      try {
        const user = await dataSources.traccar.getSession();
        return userReducer(user);
      } catch (e) {
        if (['404/not-found'].includes(e.code)) {
          throw new AuthenticationError('Service unavailable for this user');
        }
      }
    },
  },
  Mutation: {
    createSession: async (_, __, { dataSources, idToken }) => {
      const getOrCreateUser = userGetter(dataSources);
      try {
        const checkRevoked = true;
        const { uid, email, name } = await admin
          .auth()
          .verifyIdToken(idToken, checkRevoked);
        const { traccarCred } = await getOrCreateUser(uid, email, name);
        const { traccarSessionId, ...user } = await dataSources.traccar.createSession({
          email,
          password: traccarCred,
        });
        return { traccarSessionId, user: userReducer(user) };
      } catch (e) {
        if (['auth/id-token-revoked'].includes(e.code)) {
          throw new AuthenticationError(e.message);
        }
        if (['400/bad-request'].includes(e.code)) {
          throw new UserInputError('User with the same details already exists');
        }
      }
    },
    deleteSession: (_, __, { dataSources }) => {
      return dataSources.traccar.deleteSession();
    },
  },
};
