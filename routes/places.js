var express = require('express');
var router = express.Router();
const sequelize = require('../database/connect')
const Sequelize = require('sequelize')
const haversine = require('haversine')
const multer = require('multer');
const fs = require('fs')
const upload = multer();
const uuid = require('uuid');
const path = require('path')
const jwt = require('jsonwebtoken')
const placesController = require('../controller/placesController')

router.get('/all', placesController.getAllCategoryOfPlaces)
router.post('/getplacesfromward', placesController.getPlacesFromWardId)
router.post('/getallfromwardid', placesController.getAllFromWardId)
router.post('/getallfromdetail',placesController.getAllFromDetail )
router.post('/getplacesinrange', placesController.getPlacesInRange)
router.post('/insertplacefromuser', upload.any(),placesController.insertPlaceFromUser)


module.exports = router