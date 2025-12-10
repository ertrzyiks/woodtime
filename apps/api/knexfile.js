module.exports = {
  development: {
    client: "sqlite3",
    connection: {
      filename: ".dev.sqlite3",
    },
    useNullAsDefault: true,
  },
  test: {
    client: "sqlite3",
    connection: {
      filename: ".test.sqlite3",
    },
    seeds: {
      directory: "./seeds"
    },
    useNullAsDefault: true,
  },
  production: {
    client: "sqlite3",
    connection: {
      filename: "./data/prod.sqlite3",
    },
    useNullAsDefault: true,
  },
};
