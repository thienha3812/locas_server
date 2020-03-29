var express = require('express');
var router = express.Router();
const sequelize = require('../database/connect')
const Sequelize = require('sequelize')


router.get('/all',async(req,res,next)=>{
    try {
        const places = await sequelize.query('SELECT * FROM danh_muc_loai_dia_diem',{
            type: Sequelize.QueryTypes.SELECT
        })        
        return res.status(200).json({message:"Lấy danh sách thành công",code : 1,places})
        
    }catch(err){
        res.status(500)
    }
})

router.post('/addfavoriteforuser',async(req,res,next)=>{
    try {
         
    }catch(err){

    }
})
router.post('/getplacesfromward',async(req,res,next)=>{
    try {
        const {ward} = req.body        
        const places = await sequelize.query("SELECT dia_diem.*,AVG(danh_gia.rating ) as rating FROM dia_diem LEFT JOIN danh_gia ON danh_gia.ma_dd = dia_diem.ma_dd WHERE ma_xap = :ward GROUP BY dia_diem.ma_dd ORDER BY rating DESC",{
            replacements : {
                ward : ward
            },
            type : Sequelize.QueryTypes.SELECT
        })        
        return res.status(200).json({places , code : 1, message:"Lấy danh sách thành công"})
    }catch(err){
        return res.sendStatus(500)
    }
})
router.post('/getplacefrominfor', async (req,res,next)=>{
    try  {

    }catch(err){
        const { address_components} = req.body
    }
})
module.exports = router