import { makeExecutableSchema } from '@graphql-tools/schema';

import schemaString from '../../../api/src/schema.graphql?raw';

const schema = makeExecutableSchema({
  typeDefs: schemaString,
});

export default schema;
