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
        etapa: "*",
        campana: "*",
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
