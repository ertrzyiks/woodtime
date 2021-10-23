module.exports = {
  development: {
    session: {
      dbFile: '.sessions.sqlite3',
      secret: process.env.CONFIG_SESSION_SECRET || 'secret',
      cookie: {
        maxAge: 31 * 24 * 60 * 60 * 1000, // 31 days
        secure: true,
        sameSite: 'none'
      }
    }
  },
  production: {
    session: {
      dbFile: './data/sessions.sqlite3',
      secret: process.env.CONFIG_SESSION_SECRET,
      cookie: {
        maxAge: 31 * 24 * 60 * 60 * 1000, // 31 days
        secure: true,
        sameSite: 'lax',
        domain: 'ertrzyiks.me'
      }
    }
  }
}
