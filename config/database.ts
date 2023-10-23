export default ({ env }) => ({
  connection: {
    client: "mysql",
    connection: {
      host: env("DATABASE_HOST", "138.197.209.230"),
      port: env.int("DATABASE_PORT", 3306),
      database: env("DATABASE_NAME", "crm"),
      user: env("DATABASE_USERNAME", "penguin"),
      password: env("DATABASE_PASSWORD", "Ac03901582."),
      ssl: env.bool("DATABASE_SSL", false),
      charset: env("DATABASE_CHARSET", "utf8mb4"),
    },
  },
});
