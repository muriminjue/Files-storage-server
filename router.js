// import modules
const express = require("express");
const router = express.Router();
const controller = require("./controller")

router.get("/users", controller.getusers)
router.post("/users", controller.adduser)
router.post("/uploadfile", controller.uploadfile)
router.delete("/user", controller.deluser)


module.exports= router
