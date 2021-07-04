const { gql } = require("apollo-server");
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const { AuthenticationError } = require("apollo-server-express");
const typeDefs = require("./schema");

const {
  events,
  checkpoints,
  createEvent,
  deleteEvent,
  createCheckpoint,
  deleteCheckpoint,
} = require("./resolvers");

const app = express();

const users = [];
const accessTokens = [];
const refreshTokens = [];

const getUser = (token) => {
  const t = accessTokens.find((accessToken) => accessToken === token);

  if (!t) {
    return null;
  }

  const user = users.find((u) => u.id === t.userId);

  return user;
};

const resolvers = {
  Query: {
    me: (parent, args, context) => {
      return context.user;
    },
    events,
  },
  Event: {
    checkpoints,
  },
  Mutation: {
    createUser: () => {
      const user = {
        id: (users.length + 1).toString(),
        name: "Test",
      };

      users.push(user);

      return user;
    },
    createEvent,
    deleteEvent,
    createCheckpoint,
    deleteCheckpoint,
  },
};

const context = async ({ req }) => {
  const token = (req.headers.authorization || "").replace("Bearer ", "");

  return { user: getUser(token) };
};

const server = new ApolloServer({ typeDefs, resolvers, context });

server.applyMiddleware({ app, path: "/woodtime" });

app.listen(process.env.PORT || 8080, () => {
  console.log(`🚀  Server ready at http://localhost:8080/woodtime`);
});
