const express = require('express')
const router = express.Router()

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const AuthController = require('../controller/AuthController')
const authenticate = require('../middleware/authenticate')
router.get('/' ,authenticate,AuthController.list)
router.get('/:userid', authenticate,AuthController.getUserById);
router.post('/userRegister',upload.array('images',5),AuthController.userRegister)
router.post('/agentRegister',upload.array('images',5),AuthController.agentRegister)
router.post('/brokerAdminRegister',upload.array('images',5),AuthController.brokerAdminRegister)
router.post('/adminRegister',upload.array('images',5),AuthController.adminRegister)
router.post('/update',AuthController.update)
router.post('/Remove',AuthController.Remove)
router.post('/logout',AuthController.logout)
router.post('/forgotpassword',AuthController.initiatePassword)
router.post('/resetpass',AuthController.completePassword)
router.post('/login',AuthController.login)

 module.exports = router