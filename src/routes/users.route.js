const express = require("express");
const router = express.Router();
const userControllers = require("../controllers/users.controllers");

router.get("/insertData", userControllers.getDataAndInsertIntoDataBsae);
router.post("/user", userControllers.postdataforAparticularUser);
module.exports = router;
