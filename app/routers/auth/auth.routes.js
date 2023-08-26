const AuthController = require("../../http/controllers/auth/auth.controller");
const { verifyAccessToken } = require("../../http/middlewares/verifyAccessToken.middleware");

const AuthRoutes = require("express").Router();

AuthRoutes.post("/get-otp", AuthController.getOtp);
AuthRoutes.post("/check-otp", AuthController.checkOtp);
AuthRoutes.post("/register", AuthController.register);
AuthRoutes.post("/login", AuthController.login);
AuthRoutes.get("/me",verifyAccessToken, AuthController.getMe);

module.exports = AuthRoutes;
