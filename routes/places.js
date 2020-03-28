var express = require('express');
var router = express.Router();
const sequelize = require('../database/connect')
const Sequelize = require('sequelize')


router.get('/all',async(req,res,next)=>{
    try {
        const places = await sequelize.query('SELECT * FROM danh_muc_loai_dia_diem',{
            type: Sequelize.QueryTypes.SELECT
        })        
        return res.status(200).json(places)
        
    }catch(err){
        res.status(200).json({message : "Lỗi không xác định", error:true})
    }
})

router.post('/addfavoriteforuser',async(req,res,next)=>{
    try {
         
    }catch(err){
        
    }
})
module.exports = router