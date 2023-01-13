module.exports = ({ env }) => ({
  // ...
  io: {
    enabled: true,
    config: {
      IOServerOptions: {
        cors: { origin: "*", methods: ["GET"] },
      },
      contentTypes: {
        mensaje: "*",
        chat: "*",
        cliente: "*",
      },
      events: [
        {
          name: "connection",
          handler: ({ strapi }, socket) => {
            strapi.log.info(`[io] new connection with id ${socket.id}`);
          },
        },
      ],
    },
  },
  // ...
});
