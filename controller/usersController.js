const sequelize = require('../database/connect')
const Sequelize = require('sequelize')
const fs = require('fs')
const uuid = require('uuid');
const path = require('path')
const jwt = require('jsonwebtoken')
require('dotenv').config()

// Api đăng nhập 
exports.signIn = async (req, res, next) => {
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
      return res.status(200).json({ message: "Đăng nhập thành công", token, username: account[0].username, avatar: account[0].avatar, first_name: account[0].ho_nd, last_name: account[0].ten_nd, phone: account[0].sdt, email: account[0].email, birth_day: account[0].ngay_sinh, code: 1 })
    } else {
      return res.status(200).json({ message: "Đăng nhập thất bại", code: 0 })
    }
  } catch (e) {
    return res.sendStatus(500)
  }
}
// Api sửa avatar 
exports.updateAvatar = async (req, res, next) => {
  try {
    const token = req.headers["authorization"]
    const decoded = jwt.verify(token, 'secret', (err, decoded) => {
      if (err) throw (err)
      return decoded
    })
    const user_id = decoded.id
    //
    const avatar = req.file
    await sequelize.query
    const pathAvatar = path.join('./uploads/').concat(uuid.v4() + path.extname(avatar.originalname))
    // Check file type    
    const validImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
    if (!validImageTypes.includes(req.file.mimetype)) {
      return res.json({ message: "Lỗi định dạng file", code: 0 })
    }
    await sequelize.query('UPDATE nguoi_dung SET avatar = :avatar WHERE ma_nd = :user_id', {
      replacements: {
        avatar: process.env.IP_SERVER + pathAvatar,
        user_id
      }
    })
    //    
    fs.writeFileSync(pathAvatar, avatar.buffer)
    return res.json({ message: "Chỉnh sửa ảnh thành công", code: 1 })
  } catch (err) {
    return res.sendStatus(500)
  }
}
// Api cập nhật hồ sơ
exports.updateProfile = async (req, res, next) => {
  try {
    const token = req.headers["authorization"]
    const decoded = jwt.verify(token, 'secret', (err, decoded) => {
      if (err) throw (err)
      return decoded
    })
    const user_id = decoded.id
    const { first_name, last_name, birth_day, phone, email } = req.body
    console.log(birth_day)
    const query = `UPDATE nguoi_dung SET ho_nd = ${first_name != null ? '\'' + first_name + '\'' : 'ho_nd'}, ten_nd = ${last_name != null ? '\'' + last_name + '\'' : 'ten_nd'}, ngay_sinh = ${birth_day != null ? '\'' + birth_day + '\'' : 'ngay_sinh'}, sdt = ${phone != null ? '\'' + phone + '\'' : 'sdt'},email = ${email != null ? '\'' + email + '\'' : 'email'} WHERE ma_nd = ${user_id}`
    console.log(query)
    await sequelize.query(query, {
      type: Sequelize.QueryTypes.UPDATE
    })
    return res.json({ message: "Cập nhật thành công", code: 1 })
  } catch (err) {
    console.log(err)
    return res.sendStatus(500)
  }
}

// Api kiểm tra username
exports.checkUsername = async (req, res, next) => {
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
}
// Api kiểm tra phone
exports.checkPhone = async (req, res, next) => {
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
}
// APi kiểm tra email
exports.checkEmail = async (req, res, next) => {
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
}
// Api đăng ký
exports.signUp = async (req, res, next) => {
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
}

// Api cập nhật toạ độ cuối cùng
exports.updateLastCoordinate = async (req, res, next) => {
  try {
    const { coordinate } = req.body
    const token = req.headers["authorization"]
    const decoded = jwt.verify(token, 'secret', (err, decoded) => {
      if (err) throw (err)
      return decoded
    })
    const id = decoded.id
    await sequelize.query('UPDATE nguoi_dung SET toa_do_sau_cung = :coordinate WHERE ma_nd = :id',
      {
        replacements: {
          id: id,
          coordinate: JSON.stringify(coordinate)
        }
      })
    return res.status(200).json({ message: "Chỉnh sửa thành công", code: 1 })
  } catch (err) {
    return res.sendStatus(500)
  }
}

// Api lấy địa điểm yêu thích của người dùng
exports.getFavoritePlacesFromUser = async (req, res, next) => {
  try {
    const token = req.headers["authorization"]
    const decoded = jwt.verify(token, 'secret', (err, decoded) => {
      if (err) throw (err)
      return decoded
    })
    const user_id = decoded.id
    const places = await sequelize.query('SELECT dia_diem.*,COALESCE(AVG(danh_gia.rating),0) as rating, COALESCE(count(danh_gia.rating),0)  as count FROM dia_diem LEFT JOIN danh_gia ON dia_diem.ma_dd = danh_gia.ma_dd LEFT JOIN nd_yeu_thich_dia_diem on nd_yeu_thich_dia_diem.ma_dd = dia_diem.ma_dd WHERE nd_yeu_thich_dia_diem.ma_nd = :user_id GROUP BY dia_diem.ma_dd', {
      replacements: {
        user_id: user_id
      },
      type: Sequelize.QueryTypes.SELECT
    })
    return res.status(200).json({ places, message: "Lấy danh sách thành công", code: 1 })
  } catch (err) {
    return res.sendStatus(500)
  }
}
exports.insertRatingFromUser = async (req, res, next) => {
  try {
    //    
    const token = req.headers["authorization"]
    const decoded = jwt.verify(token, 'secret', (err, decoded) => {
      if (err) throw (err)
      return decoded
    })
    const user_id = decoded.id
    //
    const { description, place_id, rating } = req.body
    let imagesPath = []
    for (e of req.files) {
      imagesPath.push(path.join('./uploads/').concat(uuid.v4() + path.extname(e.originalname)))
    }
    await sequelize.query('INSERT INTO public.danh_gia(description, rating, anh_1, anh_2, anh_3, nguoi_dg, ma_dd) VALUES (:description, :rating, :image1, :image2, :image3, :user_id, :place_id)', {
      replacements: {
        description,
        rating,
        place_id,
        user_id,
        image1: process.env.IP_SERVER + imagesPath[0],
        image2: process.env.IP_SERVER + imagesPath[1],
        image3: process.env.IP_SERVER + imagesPath[2]
      }
    })
    for (i in req.files) {
      fs.writeFileSync(imagesPath[i], req.files[i].buffer)
    }

    return res.status(200).json({ message: "Thêm đánh giá thành công", code: 1 })
  } catch (err) {
    return res.sendStatus(500)
  }
}

// Thêm đánh giá
exports.insertFavoritePlaceFromUser = async (req, res, next) => {
  try {
    const token = req.headers["authorization"]
    const decoded = jwt.verify(token, 'secret', (err, decoded) => {
      if (err) throw (err)
      return decoded
    })
    const user_id = decoded.id
    const {place_id} = req.body
    await sequelize.query('INSERT INTO nd_yeu_thich_dia_diem(ma_nd,ma_dd) VALUES(:user_id,:place_id)',{
      replacements : {
        user_id,
        place_id
      },
      type : Sequelize.QueryTypes.INSERT
    })  
    return res.status(200).json({message:"Thêm thành công",code :1})
  }catch(err){
    console.log(err)
    return res.sendStatus(500)
  }
}