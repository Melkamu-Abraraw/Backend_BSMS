const express = require('express');
const router = express.Router();
const multer = require('multer');
const employeerelativeController = require('../controller/EmployeeRelativeCont');


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/showemployeerel',employeerelativeController.showemployeerelative)
router.post('/addemployeerel', upload.array('images', 5), employeerelativeController.addemployeerelative);

router.post('/deleteemployeerel',employeerelativeController.deleteemployeerelative)
router.put('/update/:EmployeeRelativeId', upload.array('images', 3), employeerelativeController.updateemployeerelative);
module.exports = router;
