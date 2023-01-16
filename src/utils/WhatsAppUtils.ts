import { Client, LocalAuth, NoAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";

class WhatsAppUtils {
  public client: Client = new Client({
    authStrategy: new LocalAuth(),
    // authStrategy: new NoAuth(),
  });

  private static instance: WhatsAppUtils;
  private static strapi;

  private constructor() {}

  public static getInstance(): WhatsAppUtils {
    if (!WhatsAppUtils.instance) {
      WhatsAppUtils.instance = new WhatsAppUtils();
    }

    return WhatsAppUtils.instance;
  }

  public async start(strapi: any): Promise<void> {
    console.log("ws iniciado");

    WhatsAppUtils.strapi = strapi;

    this.listeners();
    this.client.initialize();
  }

  private async listeners(): Promise<void> {
    this.client.on("qr", (qr) => {
      qrcode.generate(qr, { small: true });

      WhatsAppUtils.strapi["$io"].raw("qr", qr);
    });

    this.client.on("ready", () => {
      console.log("ready");
    });

    this.client.on("message", async (message) => {
      try {
        if (message.from === "status@broadcast") return;

        let clientDB = await strapi.entityService.findMany(
          "api::cliente.cliente",
          {
            filters: {
              telefono: {
                $eq: message.from,
              },
            },
          }
        );

        let client: { id: number };

        if (clientDB.length === 0) {
          clientDB = await strapi.entityService.create("api::cliente.cliente", {
            data: {
              nombre:
                message.author != null || message.author != undefined
                  ? message.author
                  : "Nombre sin registrar",
              telefono: message.from,
            },
          });

          client = clientDB;

          WhatsAppUtils.strapi["$io"].emit(
            "api::cliente.cliente.create",
            clientDB
          );
        } else {
          client = clientDB[0];
        }

        const entry = await strapi.entityService.create(
          "api::mensaje.mensaje",
          {
            data: {
              dataWS: message,
              de: message.from,
              a: message.to,
              tipo: "ENTRANTE",
              cliente: client.id,
              body: message.body,
            },
          }
        );

        WhatsAppUtils.strapi["$io"].emit("api::mensaje.mensaje.create", entry);

        const chatDB = await strapi.entityService.findMany("api::chat.chat", {
          filters: {
            cliente: {
              id: {
                $eq: client.id,
              },
            },
          },
          populate: ["mensajes"],
        });

        let chat: { id: number; mensajes: any[] };

        if (chatDB.length === 0) {
          const chatDB = await strapi.entityService.create("api::chat.chat", {
            data: {
              cliente: client.id,
              mensajes: [entry.id],
              ultimo: message.body,
            },
          });

          chat = chatDB;
          WhatsAppUtils.strapi["$io"].emit("api::chat.chat.create", chat);
        } else {
          chat = chatDB[0];
          const chatDBUP = await strapi.entityService.update(
            "api::chat.chat",
            chat.id,
            {
              data: {
                ultimo: message.body,
                mensajes: [...chat.mensajes, entry.id],
              },
            }
          );

          WhatsAppUtils.strapi["$io"].emit("api::chat.chat.update", chatDBUP);
        }
      } catch (error) {
        console.log("ERROR", error);
      }
    });
  }
}

export default WhatsAppUtils;
