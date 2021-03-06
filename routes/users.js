var express = require('express');
var router = express.Router();
const multer = require('multer');
const upload = multer();
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
router.post('/insertratingfromuser',upload.any(),usersController.insertRatingFromUser)
router.post('/insertfavoriteplacefromuser', usersController.insertFavoritePlaceFromUser)
router.post('/deletefavoriteplacefromuser',usersController.deleteFavoritePlaceFromUser)
module.exports = router;
