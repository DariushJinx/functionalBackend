
const path = require("path");
const fs = require("fs");
const ConversationModel = require("../http/models/conversation/conversation.model");

module.exports = class NamespaceSocketHandler {
  #io;
  constructor(io) {
    this.#io = io;
  }
  initConnection() {
    this.#io.on("connection", async (socket) => {
      const namespaces = await ConversationModel.find(
        {},
        {
          title: 1,
          endpoint: 1,
          rooms: 1,
        }
      ).sort({
        _id: -1,
      });
      socket.emit("namespacesList", namespaces);
    });
  }

  async createNamespacesConnection() {
    const namespaces = await ConversationModel.find(
      {},
      {
        title: 1,
        endpoint: 1,
        rooms: 1,
      }
    ).sort({
      _id: -1,
    });
    for (const namespace of namespaces) {
      this.#io.of(`/${namespace.endpoint}`).on("connection", async (socket) => {
        const conversation = await ConversationModel.findOne(
          { endpoint: namespace.endpoint },
          { endpoint: 1, rooms: 1 }
        ).sort({ _id: -1 });
        socket.emit("roomList", conversation.rooms);
        socket.on("joinRoom", async (roomName) => {
          // برای اینکه از یه گروه اومدیم بیرون دیگه اطلاعات اون رو برامون برنگردونه اینکارو میکنیم و داخل شرط از لیو استفاده میکنیم
          const lastRoom = Array.from(socket.rooms)[1];
          if (lastRoom) {
            socket.leave(lastRoom);
            await this.getCountOfOnlineUsers(namespace.endpoint, roomName);
          }
          // جوین کردیم تو اتاق حدید
          socket.join(roomName);
          await this.getCountOfOnlineUsers(namespace.endpoint, roomName);
          // بر اساس اسم اتاق فایند رو انجام میدیم و اطلاعات رو به سمت فرانت میفرستیم
          const roomInfo = conversation.rooms.find(
            (item) => item.name == roomName
          );
          // اطلاعات روم اینفو رو به سمت کلاینت میفرستیم
          socket.emit("roomInfo", roomInfo);
          this.getNewMessage(socket);
          this.getNewLocation(socket);
          this.uploadFiles(socket);
          socket.on("disconnect", async () => {
            await this.getCountOfOnlineUsers(namespace.endpoint, roomName);
          });
        });
      });
    }
  }

  // به وسیله اندپوینت به اتاق وصل میشیم
  async getCountOfOnlineUsers(endpoint, roomName) {
    // به وسیله آف به اندپوینت مورد نظر میریم
    const onlineUsers = await this.#io
      .of(`/${endpoint}`)
      .in(roomName)
      .allSockets();
    this.#io
      .of(`/${endpoint}`)
      .in(roomName)
      // اطلاعات رو به سمت فرانت میفرستیم
      .emit("countOfOnlineUsers", Array.from(onlineUsers).length);
  }

  getNewMessage(socket) {
    // اطلاعات مسیج ارسال شده از سمت فرانت رو میگیریم و ازشون استفاده میکنیم
    socket.on("newMessage", async (data) => {
      const { message, roomName, endpoint, sender } = data;
      await ConversationModel.updateOne(
        { endpoint, "rooms.name": roomName },
        {
          $push: {
            "rooms.$.messages": {
              sender,
              message,
              dateTime: Date.now(),
            },
          },
        }
      );
      // وارد اندپوینت و روم مورد نظر میشیم و دیتا رو به سمت فرانت میفرستیم
      // و برای اینکه پیام ها به صورت ریل تایم باشه از آی او استفاده میکنیم
      this.#io.of(`/${endpoint}`).in(roomName).emit("confirmMessage", data);
    });
  }

  getNewLocation(socket) {
    socket.on("newLocation", async (data) => {
      const { location, roomName, endpoint, sender } = data;
      await ConversationModel.updateOne(
        { endpoint, "rooms.name": roomName },
        {
          $push: {
            "rooms.$.locations": {
              sender,
              location,
              dateTime: Date.now(),
            },
          },
        }
      );
      this.#io.of(`/${endpoint}`).in(roomName).emit("confirmLocation", data);
    });
  }

  uploadFiles(socket) {
    socket.on("upload", ({ file, filename }, callback) => {
      const ext = path.extname(filename);
      fs.writeFile(
        "public/uploads/sockets/" + String(Date.now() + ext),
        file,
        (err) => {
          callback({ message: err ? "failure" : "success" });
        }
      );
    });
  }
};
