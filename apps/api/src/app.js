const express = require("express");
const session = require('express-session')
const cookieParser = require('cookie-parser')
const SQLiteStore = require('connect-sqlite3')(session)
const { ApolloServer } = require("apollo-server-express");
const { AuthenticationError } = require("apollo-server-express");
const typeDefs = require("./schema");
const config = require('./config')[process.env.NODE_ENV || 'development']

const {
  events,
  event,
  checkpoints,
  createEvent,
  deleteEvent,
  createCheckpoint,
  createVirtualChallenge,
  enrollVirtualChallenge,
  deleteCheckpoint,
  pointsNearby,
  virtualChallenges,
  virtualChallenge,
  checkInVirtualCheckpoint
} = require("./resolvers");

const app = express();

const users = [];

const getUser = (id) => {
  return users.find((u) => u.id === id);
};

const resolvers = {
  Query: {
    me: (parent, args, context) => {
      return context.user
    },
    events,
    event,
    pointsNearby,
    virtualChallenges,
    virtualChallenge
  },
  Event: {
    checkpoints,
  },
  Mutation: {
    signIn: (_, args, context) => {
      const user = {
        id: users.length.toString(),
        name: args.name,
      };

      users.push(user)

      context.signIn(user.id)

      return {
        success: true,
        user
      };
    },
    createEvent,
    deleteEvent,
    createCheckpoint,
    deleteCheckpoint,
    createVirtualChallenge,
    enrollVirtualChallenge,
    checkInVirtualCheckpoint
  },
};

const context = async ({ req }) => {
  const userId = req.session.user_id

  return {
    signIn: (id) => {
      req.session.user_id = id
    },
    user: getUser(userId)
  };
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context
});


app.set('trust proxy', 1)

app.use(cookieParser())
app.use(session({
  store: new SQLiteStore({
    db: config.session.dbFile
  }),
  secret: config.session.secret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: config.session.cookie.maxAge,
    secure: config.session.cookie.secure,
    sameSite: config.session.cookie.sameSite,
    domain: config.session.cookie.domain
  }
}))

module.exports = {
  app,
  server
}
