import { makeExecutableSchema } from '@graphql-tools/schema'

import schemaString from '../../../api/src/schema.graphql'

const schema = makeExecutableSchema({
  typeDefs: schemaString
})

export default schema
