const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const swaggerUI = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");
const path = require("path");
const { default: mongoose } = require("mongoose");
const AllRoutes = require("./routers/all.routes");
const { notFound, errors } = require("./utils/erroHandler.utils");
require("dotenv").config();
const app = express();

module.exports = function Application(DB_URI, PORT) {
  configApplication();
  connectToMongoDB(DB_URI);
  createServer(PORT);
  createRoutes();
  errorHandler();
};

function configApplication() {
  app.use(cors());
  app.use(morgan("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, "..", "public")));
  app.use(
    "/api-doc",
    swaggerUI.serve,
    swaggerUI.setup(
      swaggerJSDoc({
        swaggerDefinition: {
          openapi: "3.0.0",
          info: {
            title: "بک اند",
            version: "1.0.0",
            description: "دارای مسیر های متفاوت",
          },
          servers: [
            {
              url: "http://127.0.0.1:2222",
            },
          ],
          components: {
            securitySchemes: {
              BearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
              },
            },
          },
          security: [{ BearerAuth: [] }],
        },
        apis: ["./app/routers/**/*js"],
      }),
      { explorer: true }
    )
  );
}

function connectToMongoDB(uri) {
  mongoose.connect(uri).then(() => {
    console.log("connected to mongo DB...");
  });
  mongoose.connection.on("connected", () => {
    console.log("connect to mongo DB");
  });
  mongoose.connection.on("disconnected", () => {
    console.log("mongoose connection is disconnect");
  });
  process.on("SIGINT", async () => {
    await mongoose.connection.close();
    console.log("disconnected");
    process.exit(0);
  });
}

function createServer(port) {
  const http = require("http");
  const server = http.createServer(app);
  server.listen(port, () => {
    console.log(`server run on => http://127.0.0.1:${port}`);
  });
}

function createRoutes() {
  app.use(AllRoutes);
}

function errorHandler() {
  app.use((req, res, next) => {
    notFound(res);
  });
  app.use((error, req, res, next) => {
    errors(error, res);
  });
}
