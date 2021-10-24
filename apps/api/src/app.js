const express = require("express");
const session = require('express-session')
const cookieParser = require('cookie-parser')
const SQLiteStore = require('connect-sqlite3')(session)
const { ApolloServer } = require("apollo-server-express");
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
  checkInVirtualCheckpoint,
  getUser,
  signIn
} = require("./resolvers");

const app = express();

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
    signIn,
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
    user: await getUser(userId)
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
