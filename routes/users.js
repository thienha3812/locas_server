var express = require('express');
var router = express.Router();
const sequelize = require('../database/connect')
const Sequelize = require('sequelize')
var jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs')
const upload = multer();
const uuid = require('uuid')
const path = require('path')
const usersController = require('../controller/usersController')


router.post('/signin', usersController.signIn)
router.post('/updateavatar', upload.single('avatar'),usersController.updateAvatar )
router.post('/updateprofile', usersController.updateProfile )
router.post('/checkusername', usersController.checkUsername)
router.post('/checkphone', usersController.checkPhone)
router.post('/checkemail', usersController.checkEmail )
router.post('/signup', usersController.signUp)
router.post('/updatelastcoordinate', usersController.updateLastCoordinate)
router.get('/getfavoriteplacesfromuser', usersController.getFavoritePlacesFromUser)


module.exports = router;
