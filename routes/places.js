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
        const { ward } = req.body        
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
router.post('/getallfromdetail', async (req,res,next)=>{
    try  {
        const { address_components} = req.body
        const xa_phuong = '%'  + address_components[0].long_name  + '%'
        const quan_huyen ='%' +  address_components[1].long_name + '%'
        const tinh_thanh = '%' +  address_components[2].long_name   +   '%'
        const infor =  await sequelize.query("SELECT * FROM xa_phuong LEFT JOIN quan_huyen ON quan_huyen.ma_qh = xa_phuong.ma_qh LEFT JOIN tinh_thanh ON tinh_thanh.ma_tinh = quan_huyen.ma_tinh WHERE xa_phuong.ten_xap LIKE :xa_phuong AND quan_huyen.ten_qh LIKE :quan_huyen AND tinh_thanh.ten_tinh LIKE :tinh_thanh",{            
            replacements:{
                xa_phuong,
                quan_huyen,
                tinh_thanh
            },
            type : Sequelize.QueryTypes.SELECT
        })
        return res.status(200).json({infor,message:"Lấy thông tin thành công",code : 1})        
    }catch(err){
        return res.sendStatus(500)
    }
})
module.exports = router