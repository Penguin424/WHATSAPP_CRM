/**
 * mensaje controller
 */

import { factories } from "@strapi/strapi";
import { Message, MessageMedia } from "whatsapp-web.js";
import WhatsAppUtils from "../../../utils/WhatsAppUtils";

interface ICreateMensajeData {
  mensaje: string;
  a: string;
  vendedor: number;
  de: string;
  chat: number;
  isMedia: boolean;
}

export default factories.createCoreController(
  "api::mensaje.mensaje",
  ({ strapi }) => ({
    async create(ctx) {
      try {
        const body = ctx.request.body as ICreateMensajeData;
        const ws = WhatsAppUtils.getInstance();

        let message: Message;

        if (body.isMedia) {
          const media = await MessageMedia.fromUrl(body.mensaje);
          message = await ws.client.sendMessage(body.a, media);
        } else {
          message = await ws.client.sendMessage(body.a, body.mensaje);
        }

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

        let msgbody: string;
        if (body.isMedia) {
          msgbody = await (await message.downloadMedia()).data;
        } else {
          msgbody = message.body;
        }

        const entry = await strapi.entityService.create(
          "api::mensaje.mensaje",
          {
            data: {
              dataWS: message,
              de: message.from,
              a: message.to,
              tipo: "ENVIADO",
              cliente: clientDB[0].id,
              body: msgbody,
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
            populate: ["vendedor", "cliente"],
          }
        );

        strapi["$io"].emit("api::chat.chat.update", chatDB);

        return ctx.created(entry);
      } catch (error) {
        console.log(error);

        return ctx.badRequest(null, error);
      }
    },
  })
);
