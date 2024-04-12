const express = require("express");
const router = express.Router();
const multer = require("multer");
const EmployeeController = require("../controller/EmployeeController");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/showemployee", EmployeeController.showemployee);
router.post("/addemployee", upload.any(), EmployeeController.addemployee);

router.post("/deleteemployee", EmployeeController.deleteemployee);
router.put(
  "/update/:EmployeeId",
  upload.array("images", 3),
  EmployeeController.updateemployee
);
module.exports = router;
