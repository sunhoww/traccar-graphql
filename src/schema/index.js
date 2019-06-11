// @flow

import { merge } from 'lodash';

import { typeDef as User, resolvers as userResolvers } from './user';
import { typeDef as Auth, resolvers as authResolvers } from './auth';
import { typeDef as Device, resolvers as deviceResolvers } from './device';

const Query = `
  type Query {
    _empty: String
  }
`;

const Mutation = `
  type Mutation {
    _empty: String
  }
`;

export const typeDefs = [Query, Mutation, User, Auth, Device];

export const resolvers = merge(userResolvers, authResolvers, deviceResolvers);
