const { gql } = require('apollo-server')
const express = require('express')
const { ApolloServer } = require('apollo-server-express')
const { AuthenticationError } = require('apollo-server-express')

const app = express()

const users = []
const events = []
const accessTokens = []
const refreshTokens = []

const getUser = (token) => {
  const t = accessTokens.find(accessToken => accessToken === token)

  if (!t) {
    return null
  }

  const user = users.find(u => u.id === t.userId)

  return user
}

const resolvers = {
  Query: {
    me: (parent, args, context) => {
      return context.user
    },
    events: () => events,
  },
  Mutation: {
    createUser: () => {
      const user = {
        id: (users.length + 1).toString(),
        name: 'Test'
      }

      users.push(user)

      return user
    }
  }
}

const typeDefs = gql`
  type Checkpoint {
    id: Int!
    visited: Boolean!
    code: String
  }
  
  type Event {
    name: String!
    chechpoints: [Checkpoint!]!
    finished: Boolean!
    createdAt: String!
  }

  type User {
    id: String!
    name: String!
  }
  
  type Query {
    me: User
    events: [Event!]!
  }
  
  type CreateUserPayload {
    success: Boolean!
    user: User
    accessToken: String
    refreshToken: String
  }

  type LoginPayload {
    success: Boolean!
    user: User
    accessToken: String
    refreshToken: String
  }
  
  type CreateEventPayload {
    success: Boolean!
    event: Event!
  }
  
  type JoinEventPayload {
    success: Boolean!
    event: Event
  }
  
  type VisitCheckpointPayload {
    checkpoint: Checkpoint
  }
  
  type Mutation {
    createUser(name: String!): CreateUserPayload
    login(token: String!): LoginPayload
    createEvent(name: String!): CreateEventPayload
    joinEvent(id: String!): JoinEventPayload
    visitCheckpoint(eventId: String!, id: Int!, code: String): VisitCheckpointPayload
  }
`

const context = async ({ req }) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '')

  return { user: getUser(token) }
}

const server = new ApolloServer({ typeDefs, resolvers, context });


server.applyMiddleware({ app, path: '/woodtime' })

app.listen(process.env.PORT || 8080, () => {
  console.log(`🚀  Server ready at http://localhost:8080/woodtime`);
})
