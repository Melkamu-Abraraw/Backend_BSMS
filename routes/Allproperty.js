const express = require("express");
const router = express.Router();
const property = require("../controller/propertycontroller");

router.get("/all", property.fetchAllValues);
router.get("/pending", property.pendingProperty);
router.get("/assigned", property.fetchMyProperty);
router.get("/assigned/approved", property.fetchMyApprovedProperty);
router.get("/assigned", property.fetchMyProperty);
router.get("/number", property.fetchCount);
router.get("/getProperty", property.fetchProperty);
router.get("/pay", property.payment);

module.exports = router;
