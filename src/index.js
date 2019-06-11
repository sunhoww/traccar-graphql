// @flow

import { ApolloServer, AuthenticationError, ApolloError } from 'apollo-server';
import admin from 'firebase-admin';

import { typeDefs, resolvers } from './schema/index';
import TraccarAPI from './datasources/traccar';
import Firestore from './datasources/firestore';

admin.initializeApp({ credential: admin.credential.applicationDefault() });

const store = admin.firestore();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => ({
    traccar: new TraccarAPI(),
    firestore: new Firestore({ store }),
  }),
  context: async ({ req }) => {
    try {
      const re = /^Bearer\s(.*)$/.exec(req.headers.authorization);
      if (!re) {
        return {};
      }
      const idToken = re[1];
      const traccarSid = req.headers['x-traccar-session-id'];
      const { uid } = await admin.auth().verifyIdToken(idToken);
      return { idToken, uid, traccarSid };
    } catch (e) {
      if (e.constructor.name === 'FirebaseAuthError') {
        if (['auth/id-token-expired'].includes(e.code)) {
          throw new AuthenticationError(
            'ID token has expired. Get a fresh token from your client app and try again'
          );
        }
        throw new ApolloError('Error with Firebase Authentication', e.code);
      }
      throw e;
    }
  },
  cors:
    process.env.NODE_ENV === 'development'
      ? { origin: 'http://localhost:3000', credentials: true }
      : true,
});

server.listen(4000).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
