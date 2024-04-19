const express = require('express')
const router = express.Router()
const property = require('../controller/propertycontroller')
const jwt = require("jsonwebtoken");


router.get('/all',property.fetchAllValues)
router.get('/getProperty',property.fetchProperty)
module.exports = router;