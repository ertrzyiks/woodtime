const selfsigned = require('selfsigned')
const fs = require('fs')
const path = require('path')
const {app, server} = require('./app')

const getPems = () => {
  try {
    const key = fs.readFileSync(path.join(__dirname, '../tmp/key')).toString()
    const cert = fs.readFileSync(path.join(__dirname, '../tmp/cert')).toString()

    return {
      key,
      cert
    }
  }
  catch {
    const attrs = [{ name: 'commonName', value: 'localhost' }]

    const pems = selfsigned.generate(attrs, {
      algorithm: "sha256",
      days: 30,
      keySize: 2048,
      extensions: [
        {
          name: "basicConstraints",
          cA: true,
        },
        {
          name: "keyUsage",
          keyCertSign: true,
          digitalSignature: true,
          nonRepudiation: true,
          keyEncipherment: true,
          dataEncipherment: true,
        },
        {
          name: "extKeyUsage",
          serverAuth: true,
          clientAuth: true,
          codeSigning: true,
          timeStamping: true,
        },
        {
          name: "subjectAltName",
          altNames: [
            {
              // type 2 is DNS
              type: 2,
              value: "localhost",
            },
            {
              type: 2,
              value: "localhost.localdomain",
            },
            {
              type: 2,
              value: "lvh.me",
            },
            {
              type: 2,
              value: "*.lvh.me",
            },
            {
              type: 2,
              value: "[::1]",
            },
            {
              // type 7 is IP
              type: 7,
              ip: "127.0.0.1",
            },
            {
              type: 7,
              ip: "fe80::1",
            },
          ],
        },
      ],
    })

    fs.mkdirSync(path.join(__dirname, '../tmp/'), { recursive: true })
    fs.writeFileSync(path.join(__dirname, '../tmp/key'), pems.private)
    fs.writeFileSync(path.join(__dirname, '../tmp/cert'), pems.cert)

    return {
      key: pems.private,
      cert: pems.cert
    }
  }
}

const pems = getPems()

async function init() {
  await server.start()
  server.applyMiddleware({
    app,
    path: '/woodtime',
    cors: {
      origin: ['https://studio.apollographql.com', 'http://localhost:3000', 'http://localhost:6006'],
      credentials: true
    }
  });

  const https = require('https')
  https.createServer({
    key: pems.key,
    cert: pems.cert
  }, app).listen(process.env.PORT || 8080, () => {
    console.log(`🚀  Test server ready at https://localhost:8080/woodtime`);
  })
}

init()
