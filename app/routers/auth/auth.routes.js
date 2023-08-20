const AuthController = require("../../http/controllers/auth/auth.controller");

const AuthRoutes = require("express").Router();

AuthRoutes.post("/get-otp", AuthController.getOtp);
AuthRoutes.post("/check-otp", AuthController.checkOtp);
AuthRoutes.post("/register", AuthController.register);
AuthRoutes.post("/login", AuthController.login);


module.exports = AuthRoutes;
