var express = require('express');
var router = express.Router();
const sequelize = require('../database/connect')
const Sequelize = require('sequelize')
var jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs')
const upload = multer();
/* GET users listing. */


router.post('/signin', async (req, res, next) => {
  const { username, password } = req.body
  try {
    const account = await sequelize.query("SELECT * FROM nguoi_dung WHERE username = :username AND md5_pass = :password", {
      replacements: {
        username: username,
        password: password
      },
      type: Sequelize.QueryTypes.SELECT
    })
    if (account.length != 0) {
      const token = await jwt.sign({ username: account[0].username, id: account[0].ma_nd }, 'secret', { algorithm: 'HS512' })
      return res.status(200).json({ message: "Đăng nhập thành công", token, username: account[0].username, avatar: account[0].avatar, code: 1 })
    } else {
      return res.status(200).json({ message: "Đăng nhập thất bại", code: 0 })
    }
  } catch (e) {
    return res.sendStatus(500)
  }
})
router.post('/updateprofile', upload.single('avatar'), async (req, res, next) => {
  try {
    const token = req.headers["authorization"]    
    let ext = require('path').extname(req.file.originalname)    
    let fileName = Date.now()  + ext
    const path = require('path').join('./uploads/').concat(fileName )
    fs.writeFile(path,req.file.buffer,function(err){
      if(err) throw err
    })    
    const decoded = jwt.verify(token, 'secret', (err, decoded) => {
      if (err) throw (err)
      return decoded
    })
    const id = decoded.id
    const { first_name, last_name } = req.body
    await sequelize.query('UPDATE nguoi_dung SET ho_nd = :last_name,avatar = :avatar,ten_nd = :first_name WHERE ma_nd = :id ', {
      replacements: {
        id: id,
        first_name: first_name,
        last_name: last_name,
        avatar : 'http://149.28.145.107:8000/'  + path
      },
      type: Sequelize.QueryTypes.UPDATE
    })
    return res.json({message:"Cập nhật thành công",code : 1})
  } catch (err) {
    return res.sendStatus(500)
  }
})
router.post('/checkusername', async (req, res, next) => {
  try {
    const { username } = req.body
    const usernames = await sequelize.query("SELECT username from nguoi_dung WHERE username = :username", {
      replacements: {
        username: username
      },
      type: Sequelize.QueryTypes.SELECT
    })
    if (usernames.length !== 0) {
      res.status(200).json({ message: "Tài khoản đã tồn tại", code: 1 })
    } else {
      res.status(200).json({ message: "Tài khoản không tồn tại", code: 0 })
    }
  } catch (err) {
    return res.sendStatus(500)
  }
})
router.post('/checkphone', async (req, res, next) => {
  try {
    const { phone } = req.body
    const phones = await sequelize.query("SELECT sdt from nguoi_dung WHERE sdt = :phone", {
      replacements: {
        phone: phone
      },
      type: Sequelize.QueryTypes.SELECT
    })
    if (phones.length !== 0) {
      return res.status(200).json({ message: "Sdt đã tồn tại", code: 1 })
    } else {
      return res.status(200).json({ message: "Sdt không tồn tại", code: 0 })
    }
  } catch (err) {
    return res.sendStatus(500)
  }
})
router.post('/checkemail', async (req, res, next) => {
  try {
    const { email } = req.body
    const emails = await sequelize.query("SELECT email from nguoi_dung WHERE email = :email", {
      replacements: {
        email: email
      },
      type: Sequelize.QueryTypes.SELECT
    })
    if (emails.length !== 0) {
      return res.status(200).json({ message: "Email đã tồn tại", code: 1 })
    } else {
      return res.status(200).json({ message: "Email không tồn tại", code: 0 })
    }
  } catch (err) {
    return res.sendStatus(500)
  }
})

router.post('/signup', async (req, res, next) => {
  try {
    const { username, password, phone, email } = req.body
    await sequelize.query("INSERT INTO nguoi_dung(username,md5_pass,sdt,email) VALUES(:username,:password,:phone,:email)", {
      replacements: {
        username: username,
        password: password,
        phone: phone,
        email: email
      },
      type: Sequelize.QueryTypes.INSERT
    })
    return res.status(200).json({ message: "Đăng ký thành công", code: 1 }) // Đăng ký thành công
  } catch (e) {
    return res.status(200).json({ message: "Tài khoản hoặc email đã tồn tại", code: 0 })
  }
})
router.post('/updatelastcordinate', async (req, res, next) => {
  try {
    const { cordinate } = req.body
    const token = req.headers["authorization"]
    const decoded = jwt.verify(token, 'secret', (err, decoded) => {
      if (err) throw (err)
      return decoded
    })
    const id = decoded.id
    await sequelize.query('UPDATE nguoi_dung SET toa_do_sau_cung = :cordinate WHERE ma_nd = :id',
      {
        replacements: {
          id: id,
          cordinate: JSON.stringify(cordinate)
        }
      })
    return res.status(200).json({ message: "Chỉnh sửa thành công", code: 1 })

  } catch (err) {
    return res.sendStatus(500)
  }
})
router.post('/getfavoriteplacesfromuser', async (req, res, next) => {
  try {
    const token = req.headers["authorization"]
    const decoded = jwt.verify(token, 'secret', (err, decoded) => {
      if (err) throw (err)
      return decoded
    })
    const id = decoded.id
    const places = await sequelize.query('SELECT * FROM nd_yeu_thich_dia_diem WHERE ma_nd = :id ', {
      replacements: {
        id: id
      },
      type: Sequelize.QueryTypes.SELECT
    })
    return res.status(200).json({ places, message: "Lấy danh sách thành công", code: 1 })
  } catch (err) {
    return res.sendStatus(500)
  }
})
module.exports = router;
