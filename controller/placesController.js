const sequelize = require('../database/connect')
const Sequelize = require('sequelize')
const haversine = require('haversine')
const fs = require('fs')
const uuid = require('uuid');
const path = require('path')
const jwt = require('jsonwebtoken')
require('dotenv').config()

/// Thêm địa điểm từ người dùng
exports.insertPlaceFromUser = async (req, res, next) => {
    try {
        const token = req.headers["authorization"]
        const decoded = jwt.verify(token, 'secret', (err, decoded) => {
            if (err) throw (err)
            return decoded
        })
        const validImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
        //Kiểm tra định dang file
        req.files.forEach(file => {
            if (!validImageTypes.includes(file.mimetype)) {
                return res.json({ message: "Lỗi định dạng file", code: 0 })
            }
        })
        const user_id = decoded.id
        const image = req.files.filter(x => x.fieldname === 'hinh_anh')[0]
        const logo = req.files.filter(x => x.fieldname === 'logo')[0] != null ? eq.files.filter(x => x.fieldname === 'logo')[0] : null
        const { ten_dd, mo_ta, toa_do, gio_mo_cua, gio_dong_cua, ma_dm, ma_xap, dia_chi, luoc_su } = req.body
        const imagePath = path.join('./uploads/').concat(uuid.v4() + path.extname(image.originalname))
        let logoPath
        if (logo != null) {
            logoPath = path.join('./uploads/').concat(uuid.v4() + path.extname(logo.originalname))
        }
        await sequelize.query("INSERT INTO dia_diem(ten_dd, mo_ta, toa_do, logo, gio_mo_cua, gio_dong_cua, luoc_su_hinh_thanh,nguoi_tao,ma_xap,hinh_anh,ma_dm,dia_chi) VALUES(:ten_dd,:mo_ta,:toa_do,:logo,:gio_mo_cua,:gio_dong_cua,:luoc_su,:nguoi_tao,:ma_xap,:hinh_anh,:ma_dm,:dia_chi) ", {
            replacements: {
                ten_dd: ten_dd,
                mo_ta: mo_ta,
                toa_do: toa_do,
                logo: logo != null ? process.env.IP_SERVER  + logoPath : '',
                gio_mo_cua: gio_mo_cua,
                gio_dong_cua: gio_dong_cua,
                nguoi_tao: user_id,
                ma_xap: ma_xap,
                hinh_anh: process.env.IP_SERVER + imagePath,
                ma_dm: ma_dm,
                dia_chi: dia_chi,
                luoc_su: luoc_su
            },
            type: Sequelize.QueryTypes.INSERT
        })
        const p1 = Promise.resolve(fs.writeFileSync(imagePath, image.buffer))
        const p2 = logo != null ? Promise.resolve(fs.writeFileSync(logoPath, logo.buffer)) : null
        Promise.all([p1, p2]).then(() => {
            return res.json({ message: "Thêm thành công", code: 1 })
        }).catch(err => {
            throw new Error()
        })

    } catch (err) {
        console.log(err)
        return res.sendStatus(500)
    }
}
// Lấy địa điểm từ khoảng cách
exports.getPlacesInRange = async (req, res, next) => {
    try {
        const { distance, coordinate } = req.body
        var places = await sequelize.query('SELECT dia_diem.*,COALESCE(AVG(danh_gia.rating),0) as rating, COALESCE(count(danh_gia.rating),0)  as count FROM dia_diem LEFT JOIN danh_gia ON dia_diem.ma_dd = danh_gia.ma_dd LEFT JOIN nd_yeu_thich_dia_diem on nd_yeu_thich_dia_diem.ma_dd = dia_diem.ma_dd GROUP BY dia_diem.ma_dd', {
            type: Sequelize.QueryTypes.SELECT,
        })
        let results = []
        places.forEach(x => {
            const start = {
                latitude: coordinate.lat,
                longitude: coordinate.lng
            }
            const end = {
                latitude: x.toa_do.lat,
                longitude: x.toa_do.lng
            }
            const d = haversine(start, end, { unit: 'meter' })
            if (d < distance) {
                results.push(x)
            }
        })
        return res.json({ message: "Lấy danh sách thành công", results })
    } catch (err) {
        return res.sendStatus(500)
    }
}
// Lấy tất cả địa điểm theo thông tin
exports.getAllFromDetail = async (req, res, next) => {
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
}
// Lấy tất cả thông tin tỉnh thành quận huyện từ id phường xã
exports.getAllFromWardId = async (req, res, next) => {
    try {
        const { ward_id } = req.body // Mã xã phường
        const places = await sequelize.query('SELECT * FROM xa_phuong LEFT JOIN quan_huyen ON quan_huyen.ma_qh = xa_phuong.ma_qh LEFT JOIN tinh_thanh ON tinh_thanh.ma_tinh = quan_huyen.ma_tinh WHERE xa_phuong.ma_xap = :ward_id', {
            replacements: {
                ward_id: ward_id,
            },
            type: Sequelize.QueryTypes.SELECT
        })
        return res.status(200).json({ places, message: "Lấy danh sách thành công", code: 1 })

    } catch (err) {
        return res.sendStatus(500)
    }
}
// Lấy tất cả địa điểm từ id phường xã 
exports.getPlacesFromWardId = async (req, res, next) => {
    try {
        const { ward } = req.body // Mã xã phường
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
}
// Lấy tất cả danh mục địa điểm
exports.getAllCategoryOfPlaces  = async (req, res, next) => {
    try {
        const places = await sequelize.query('SELECT * FROM danh_muc_loai_dia_diem', {
            type: Sequelize.QueryTypes.SELECT
        })
        return res.status(200).json({ message: "Lấy danh sách thành công", code: 1, places })

    } catch (err) {
        res.status(500)
    }
}