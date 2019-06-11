// @flow

import { gql, AuthenticationError } from 'apollo-server';
import { pick } from 'lodash';

import type { Context } from '../types';

export const typeDef = gql`
  type User {
    id: Int!
    email: String
    name: String
  }
`;

export function userReducer(user: Object) {
  return pick(user, ['id', 'email', 'name']);
}

export const resolvers = {};
