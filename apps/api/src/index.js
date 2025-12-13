const {app, server, contextFunction} = require('./app')
const { expressMiddleware } = require('@apollo/server/express4')
const cors = require('cors')
const bodyParser = require('body-parser')

async function init() {
  await server.start()
  
  app.use(
    "/woodtime",
    cors({
      origin: 'https://woodtime.ertrzyiks.me',
      credentials: true
    }),
    bodyParser.json(),
    expressMiddleware(server, {
      context: contextFunction
    })
  );

  app.listen(process.env.PORT || 8080, () => {
    console.log(`🚀  Server ready at http://localhost:8080/woodtime`);
  });
}

init()
