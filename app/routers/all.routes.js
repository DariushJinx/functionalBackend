const AuthRoutes = require("./auth/auth.routes");
const HomeRoutes = require("./home/home.routes");

const AllRoutes = require("express").Router();

AllRoutes.use("/",HomeRoutes);
AllRoutes.use("/auth",AuthRoutes);

module.exports = AllRoutes;
