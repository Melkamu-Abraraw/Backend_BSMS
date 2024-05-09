const express = require("express");
const router = express.Router();
const paymentController = require("../controller/paymentController");

router.post("/pay", paymentController.Payment);
router.post("/verifyPayment", paymentController.verifyPayment);
router.get("/transfer", paymentController.TranferMoney);
module.exports = router;
