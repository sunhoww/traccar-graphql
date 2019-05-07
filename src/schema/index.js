import { typeDef as User, resolvers as userResolvers } from './user';

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

export const typeDefs = [Query, Mutation, User];

export const resolvers = Object.assign(userResolvers);
