var express = require('express');
var router = express.Router();
const multer = require('multer');
const upload = multer();
const placesController = require('../controller/placesController')

router.get('/all', placesController.getAllCategoryOfPlaces)
router.post('/getplacesfromward', placesController.getPlacesFromWardId)
router.post('/getallfromwardid', placesController.getAllFromWardId)
router.post('/getallfromdetail',placesController.getAllFromDetail )
router.post('/getplacesinrange', placesController.getPlacesInRange)
router.post('/insertplacefromuser', upload.any(),placesController.insertPlaceFromUser)
router.post('/getrating',placesController.getRating)
module.exports = router