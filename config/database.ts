export default ({ env }) => ({
  connection: {
    client: "mysql",
    connection: {
      host: env("DATABASE_HOST", "localhost"),
      port: env.int("DATABASE_PORT", 3306),
      database: env("DATABASE_NAME", "cosbiome_crm"),
      user: env("DATABASE_USERNAME", "cosbiome"),
      password: env("DATABASE_PASSWORD", "Ac03901582"),
      ssl: env.bool("DATABASE_SSL", false),
      charset: env("DATABASE_CHARSET", "utf8mb4"),
    },
  },
});
