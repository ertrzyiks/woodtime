const fs = require('fs')
const path = require('path')

const typeDefs = fs.readFileSync(path.join(__dirname, './schema.graphql')).toString()

module.exports = typeDefs;
