const MenuController = require("../../http/controllers/menu/menu.controller");
const {
  verifyAccessToken,
} = require("../../http/middlewares/verifyAccessToken.middleware");

const MenuRoutes = require("express").Router();

MenuRoutes.post(
  "/add",
  verifyAccessToken,
  MenuController.createMenu
);
MenuRoutes.get("/list", MenuController.getListOfMenus);
MenuRoutes.patch(
  "/update/:field",
  verifyAccessToken,
  MenuController.updateMenu
);
MenuRoutes.delete(
  "/remove/:field",
  verifyAccessToken,
  MenuController.removeMenu
);
MenuRoutes.patch(
  "/add-submenu/:titleName",
  verifyAccessToken,
  MenuController.createSubmenu
);

module.exports = MenuRoutes;
