const express = require("express");
const router = express.Router();
const property = require("../controller/propertycontroller");
const authenticate = require("../middleware/authenticate");

router.get("/all", property.fetchAllValues);
module.exports = router;
