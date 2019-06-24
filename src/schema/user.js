// @flow

import { gql, AuthenticationError } from 'apollo-server';
import { pick } from 'lodash';

import type { Context } from '../types';

export const typeDef = gql`
  type User {
    id: ID!
    uid: String!
    email: String
    name: String
  }
`;

export function userReducer(user: Object) {
  return pick(user, ['id', 'uid', 'email', 'name']);
}

export const resolvers = {};
