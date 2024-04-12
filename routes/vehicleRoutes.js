
const express = require('express');
const router = express.Router();
const multer = require('multer');
const vehiclecontroller = require('../controller/VehicleController');
const {isBrokerAdmin,verifyToken}=require('../middleware/brokeradminAuthenticate')
const authenticate = require('../middleware/authenticate')
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/showvehicle',vehiclecontroller.showvehicle)

router.get('/:vehicleId',vehiclecontroller.getvehiclebyid)
router.post('/upload', upload.array('images', 5), vehiclecontroller.uploadvehicle);

router.post('/deletevehicle',vehiclecontroller.deletevehicle)
router.put('/updatevehicle/:VehicleId', upload.array('images', 3), vehiclecontroller.updatevehicle);
router.put('/approve/:vehicleId/:Email', authenticate,vehiclecontroller.approveVehicle);
router.put('/reject/:vehicleId/:Email', authenticate,vehiclecontroller.rejectVehicle);
router.put('/assign/:vehicleId/:Email',verifyToken,isBrokerAdmin,vehiclecontroller.assignBrokerToVehicle)
module.exports = router;