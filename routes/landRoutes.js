
const express = require('express');
const router = express.Router();
const multer = require('multer');
const LandController = require('../controller/LandController');
const {isBrokerAdmin,verifyToken}=require('../middleware/brokeradminAuthenticate')
const authenticate = require('../middleware/authenticate')
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/showland',LandController.showland)
router.get('/:landID',LandController.getlandbyid)
router.post('/uploadland', authenticate,upload.array('images', 5), LandController.uploadland);

router.post('/deleteland',LandController.deleteland)
router.put('/updateland/:LandId', upload.array('images', 3), LandController.updateland);
router.put('/approve/:landID/:Email',authenticate,LandController.approveLand);
router.put('/reject/:landID/:Email',authenticate,LandController.rejectLand);
router.put('/assign/:landID/:Email',verifyToken,isBrokerAdmin,LandController.assignBrokerToLand)
module.exports = router;
