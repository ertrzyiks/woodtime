const express = require("express");
const session = require('express-session')
const cookieParser = require('cookie-parser')
const SQLiteStore = require('connect-sqlite3')(session)
const { ApolloServer, AuthenticationError, ApolloError } = require("apollo-server-express")
const { applyMiddleware } = require('graphql-middleware')
const { GraphQLScalarType, Kind } = require('graphql')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const { shield, allow, rule } = require('graphql-shield')
const typeDefs = require("./schema");
const Database = require("./datasources/database");
const config = require('./config')[process.env.NODE_ENV || 'development']

const dateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'Date time custom scalar type',
  serialize(value) {
    return value.toISOString()
  },
  parseValue(value) {
    return new Date(value)
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value)
    }
    return null
  },
})

const {
  events,
  event,
  checkpoints,
  createEvent,
  deleteEvent,
  createCheckpoint,
  createVirtualChallenge,
  enrollVirtualChallenge,
  friends,
  inviteToEvent,
  joinEvent,
  deleteCheckpoint,
  participants,
  pointsNearby,
  virtualChallenges,
  virtualChallenge,
  checkInVirtualCheckpoint,
  signIn
} = require("./resolvers");

const app = express();

const resolvers = {
  DateTime: dateTimeScalar,
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
    virtual_challenge: (parent) => {
      return parent.virtual_challenge_id ? { id: parent.virtual_challenge_id } : null
    },
    participants
  },
  Me: {
    friends
  },
  Mutation: {
    signIn,
    createEvent,
    deleteEvent,
    inviteToEvent,
    joinEvent,
    createCheckpoint,
    deleteCheckpoint,
    createVirtualChallenge,
    enrollVirtualChallenge,
    checkInVirtualCheckpoint
  },
}

const isAuthenticated = rule()(async (parent, args, ctx, info) => {
  return Boolean(ctx.user)
})

const permissions = shield({
  Query: {
    '*': isAuthenticated,
    me: allow
  },
  Mutation: {
    '*': isAuthenticated,
    signIn: allow
  }
},{
  fallbackError: async (thrownThing, parent, args, context, info) => {
    if (thrownThing === null) {
      return new AuthenticationError('Access denied')
    }
    if (thrownThing instanceof ApolloError) {
      // expected errors
      return thrownThing
    }
    if (thrownThing instanceof Error) {
      // unexpected errors
      console.error(thrownThing)
      return new ApolloError('Internal server error', 'ERR_INTERNAL_SERVER')
    }

    // what the hell got thrown
    console.error('The resolver threw something that is not an error.')
    console.error(thrownThing)
    return new ApolloError('Internal server error', 'ERR_INTERNAL_SERVER')
  }
})

const context = async ({ req }) => {
  const userId = req.session.user_id

  return {
    signIn: (id) => {
      req.session.user_id = id
    },
    _userId: userId
  };
};

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
})

const loadSessionUser = async (resolve, root, args, context, info) => {
  const user = context._userId ? await context.dataSources.db.findUserById(context._userId) : null
  return resolve(root, args, { ...context, user }, info)
}

const server = new ApolloServer({
  schema: applyMiddleware(schema, loadSessionUser, permissions),
  context,
  dataSources: () => ({
    db: new Database()
  })
});

app.set('trust proxy', 1)

app.use(cookieParser())
app.use(session({
  store: new SQLiteStore({
    db: config.session.dbFile
  }),
  secret: config.session.secret,
  resave: false,
  rolling: true,
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
