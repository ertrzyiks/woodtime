module.exports = {
  development: {
    client: "sqlite3",
    connection: {
      filename: ".dev.sqlite3",
    },
  },
  production: {
    client: "sqlite3",
    connection: {
      filename: "./data/prod.sqlite3",
    },
  },
};
