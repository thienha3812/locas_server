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
router.get('/all', async (req, res, next) => {
    try {
        const places = await sequelize.query('SELECT * FROM danh_muc_loai_dia_diem', {
            type: Sequelize.QueryTypes.SELECT
        })
        return res.status(200).json({ message: "Lấy danh sách thành công", code: 1, places })

    } catch (err) {
        res.status(500)
    }
})
router.post('/getplacesfromward', async (req, res, next) => {
    try {
        const { ward } = req.body
        const places = await sequelize.query("SELECT dia_diem.*,AVG(danh_gia.rating ) as rating FROM dia_diem LEFT JOIN danh_gia ON danh_gia.ma_dd = dia_diem.ma_dd WHERE ma_xap = :ward GROUP BY dia_diem.ma_dd ORDER BY rating DESC", {
            replacements: {
                ward: ward
            },
            type: Sequelize.QueryTypes.SELECT
        })
        return res.status(200).json({ places, code: 1, message: "Lấy danh sách thành công" })
    } catch (err) {
        return res.sendStatus(500)
    }
})
router.post('/getallfromdetail', async (req, res, next) => {
    try {
        const { address_components } = req.body
        const xa_phuong = '%' + address_components[0].long_name + '%'
        const quan_huyen = '%' + address_components[1].long_name + '%'
        const tinh_thanh = '%' + address_components[2].long_name + '%'
        const infor = await sequelize.query("SELECT * FROM xa_phuong LEFT JOIN quan_huyen ON quan_huyen.ma_qh = xa_phuong.ma_qh LEFT JOIN tinh_thanh ON tinh_thanh.ma_tinh = quan_huyen.ma_tinh WHERE xa_phuong.ten_xap LIKE :xa_phuong AND quan_huyen.ten_qh LIKE :quan_huyen AND tinh_thanh.ten_tinh LIKE :tinh_thanh", {
            replacements: {
                xa_phuong,
                quan_huyen,
                tinh_thanh
            },
            type: Sequelize.QueryTypes.SELECT
        })
        return res.status(200).json({ infor, message: "Lấy thông tin thành công", code: 1 })
    } catch (err) {
        return res.sendStatus(500)
    }
})
router.post('/getplacesinrange', async (req, res, next) => {
    try {
        const { distance, coordinate } = req.body
        var places = await sequelize.query('SELECT * FROM dia_diem', {
            type: Sequelize.QueryTypes.SELECT,            
        })
        
        places.forEach(x=>{
            console.log(x.toa_do)
        })
        return res.send("1")
    } catch (err) {
        console.log(err)
        return res.sendStatus(500)
    }
})
router.post('/insertplacefromuser',upload.any(),async(req,res,next)=>{
    try {
        const token = req.headers["authorization"]
        const decoded = jwt.verify(token, 'secret', (err, decoded) => {
            if (err) throw (err)
            return decoded
        })
        const user_id = decoded.id
        const image = req.files.filter(x => x.fieldname === 'hinh_anh')[0]        
        const logo = req.files.filter(x => x.fieldname === 'logo')[0]                
        const {ten_dd,mo_ta,toa_do,gio_mo_cua,gio_dong_cua,ma_dm,ma_xap,dia_chi,luoc_su} = req.body
        const imagePath = path.join('./uploads/').concat(uuid.v4() + path.extname(image.originalname))
        const logoPath = path.join('./uploads/').concat(uuid.v4() + path.extname(logo.originalname))                 
        await sequelize.query("INSERT INTO dia_diem(ten_dd, mo_ta, toa_do, logo, gio_mo_cua, gio_dong_cua, luoc_su_hinh_thanh,nguoi_tao,ma_xap,hinh_anh,ma_dm,dia_chi) VALUES(:ten_dd,:mo_ta,:toa_do,:logo,:gio_mo_cua,:gio_dong_cua,:luoc_su,:nguoi_tao,:ma_xap,:hinh_anh,:ma_dm,:dia_chi) ",{
            replacements : {
                ten_dd : ten_dd,
                mo_ta : mo_ta,
                toa_do : toa_do,
                logo : 'http://149.28.145.107:8000/' + logoPath,
                gio_mo_cua : gio_mo_cua,
                gio_dong_cua : gio_dong_cua,
                nguoi_tao : user_id,
                ma_xap : ma_xap,
                hinh_anh : 'http://149.28.145.107:8000/'+ imagePath,
                ma_dm : ma_dm,
                dia_chi : dia_chi,
                luoc_su : luoc_su
            },
            type : Sequelize.QueryTypes.INSERT
        })        
        const p1 = Promise.resolve(fs.writeFileSync(imagePath,image.buffer))
        const p2 = Promise.resolve(fs.writeFileSync(logoPath,logo.buffer))
        Promise.all([p1,p2]).then(()=>{
            return res.json({message : "Thêm thành công",code : 1})
        }).catch(err=>{
            throw new Error()
        })
        
    }catch(err){  
        console.log(err)      
        return res.sendStatus(500)
    }
})

module.exports = router