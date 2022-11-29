const express = require("express");
const mainControllers = require("../controllers/main-c");

const router = express.Router();

router.get("/", mainControllers.getIndex);

module.exports = router;