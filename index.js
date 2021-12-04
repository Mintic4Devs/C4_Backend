import express from 'express';
import cors from 'cors';
import { ApolloServer } from 'apollo-server-express';
import dotenv from 'dotenv';
import connectBD from './database/database.js';
import { tipos } from './graphql/types.js';
import { resolvers } from './graphql/resolvers.js';
import { validateToken } from './utils/tokenUtils.js';
import {
  ApolloServerPluginLandingPageGraphQLPlayground
} from "apollo-server-core";

dotenv.config();

const getUserData = (token) => {
  const verificacion = validateToken(token.split(' ')[1]);
  if (verificacion.data) {
    return verificacion.data;
  } else {
    return null;
  }
};

const server = new ApolloServer({
  typeDefs: tipos,
  resolvers: resolvers,
  plugins: [
    ApolloServerPluginLandingPageGraphQLPlayground(),
  ],
  context: ({ req }) => {
    const token = req.headers?.authorization ?? null;
    if (token) {
      const userData = getUserData(token);
      if (userData) {
        return { userData };
      }
    }
    return null;
  },
});

const app = express();

app.use(express.json());

app.use(cors());

app.listen({ port: process.env.PORT || 4000 }, async () => {
  await connectBD();
  await server.start();

  server.applyMiddleware({ app });

  console.log('Servidor funcionando');
});
