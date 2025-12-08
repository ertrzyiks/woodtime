module.exports = {
  development: {
    client: "sqlite3",
    connection: {
      filename: ".dev.sqlite3",
    },
  },
  test: {
    client: "sqlite3",
    connection: {
      filename: ".test.sqlite3",
    },
    seeds: {
      directory: "./seeds"
    }
  },
  production: {
    client: "sqlite3",
    connection: {
      filename: "./data/prod.sqlite3",
    },
  },
};
