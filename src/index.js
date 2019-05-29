import { ApolloServer, AuthenticationError } from 'apollo-server';

import { typeDefs, resolvers } from './schema/index';
import TraccarAPI from './datasources/traccar';
import { extractToken } from './auth';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => ({ traccar: new TraccarAPI() }),
  context: async ({ req }) => {
    try {
      const re = /^Bearer\s(.*)$/.exec(req.headers.authorization);
      const claims = await extractToken(re[1]);
      return { claims };
    } catch (e) {
      if (
        ['TokenExpiredError', 'JsonWebTokenError', 'NotBeforeError'].includes(e.name)
      ) {
        throw new AuthenticationError(e.message);
      }
      if (e.name === 'TypeError') {
        return { claims: {} };
      }
      throw e;
    }
  },
  cors:
    process.env.NODE_ENV === 'development'
      ? { origin: 'http://localhost:3000', credentials: true }
      : true,
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
