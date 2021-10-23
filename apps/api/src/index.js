const {app, server} = require('./app')

async function init() {
  await server.start()
  server.applyMiddleware({
    app,
    path: "/woodtime",
    cors: {
      origin: 'https://woodtime.ertrzyiks.me',
      credentials: true
    }
  });

  app.listen(process.env.PORT || 8080, () => {
    console.log(`🚀  Server ready at http://localhost:8080/woodtime`);
  });
}

init()
