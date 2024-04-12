
const express = require('express');
const router = express.Router();
const multer = require('multer');
const houseController = require('../controller/HouseController');
const {isBrokerAdmin,verifyToken}=require('../middleware/brokeradminAuthenticate')
const authenticate = require('../middleware/authenticate')
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/showHouse',houseController.showHouse)
router.get('/:houseId',houseController.gethousebyid)
router.post('/upload', upload.array('images', 5), houseController.uploadImages);

router.post('/deleteProp',houseController.deleteProperty)
router.put('/update/:propertyId', upload.array('images', 3), houseController.updateProperty);
router.put('/approve/:houseId/:Email',authenticate,houseController.approveHouse);
router.put('/reject/:houseId/:Email',authenticate, houseController.rejectHouse);
router.put('/assign/:houseId/:Email',verifyToken,isBrokerAdmin,houseController.assignBrokerToHouse)
module.exports = router;