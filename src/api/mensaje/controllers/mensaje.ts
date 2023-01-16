/**
 * mensaje controller
 */

import { factories } from "@strapi/strapi";
import WhatsAppUtils from "../../../utils/WhatsAppUtils";

interface ICreateMensajeData {
  mensaje: string;
  a: string;
  vendedor: number;
  de: string;
  chat: number;
}

export default factories.createCoreController(
  "api::mensaje.mensaje",
  ({ strapi }) => ({
    async create(ctx) {
      try {
        const body = ctx.request.body as ICreateMensajeData;
        const ws = WhatsAppUtils.getInstance();
        const message = await ws.client.sendMessage(body.a, body.mensaje);

        let clientDB: { id: number }[] = await strapi.entityService.findMany(
          "api::cliente.cliente",
          {
            filters: {
              telefono: {
                $eq: message.to,
              },
            },
          }
        );

        const entry = await strapi.entityService.create(
          "api::mensaje.mensaje",
          {
            data: {
              dataWS: message,
              de: message.from,
              a: message.to,
              tipo: "ENVIADO",
              cliente: clientDB[0].id,
              body: message.body,
              chat: body.chat,
            },
          }
        );

        const chatDB = await strapi.entityService.update(
          "api::chat.chat",
          body.chat,
          {
            data: {
              ultimo: message.body,
            },
          }
        );

        strapi["$io"].emit("api::chat.chat.update", chatDB);

        return ctx.created(entry);
      } catch (error) {
        return ctx.badRequest(null, error);
      }
    },
  })
);
