var express = require('express');
var router = express.Router();
const sequelize = require('../database/connect')
const Sequelize = require('sequelize')
var jwt = require('jsonwebtoken');
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
      const token = await jwt.sign({ foo: 'bar' }, 'secret', { algorithm: 'HS512' })
      res.status(200).json({ message: "Đăng nhập thành công", token })
    } else {
      throw new Error("Tài khoản hoặc mật khẩu không đúng")
    }
  } catch (e) {
    res.status(200).json({ message: "Tài khoản hoặc email đã tồn tại" })
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
    if(usernames.length !== 0){
      res.status(200).json({message :"Tài khoản đã tồn tại"})
    }else{
      res.status(200).json({message :"Tài khoản không tồn tại"})
    }
    res.status(200).json()
  } catch (err) {
    next()
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
    if(phones.length !==0){
      res.status(200).json({message:"Sdt đã tồn tại"})
    }else{
      res.status(200).json({message:"Sdt không tồn tại"})
    }    
  } catch (err) {
    next()
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
    if(emails.length !== 0){
      res.status(200).json({message :"Email đã tồn tại"})
    }else{
      res.status(200).json({message :"Email không tồn tại"})
    }  
  } catch (err) {
    next()
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
      type: Sequelize.QueryTypes.SELECT
    })
    return res.status(200).json({ message: "Đăng ký thành công"})
  } catch (e) {
    return res.status(200).json({ message: "Tài khoản hoặc mật khẩu đã tồn tại"})
  }
})
module.exports = router;
