const express = require('express')
const authorRoute = express()
const session = require('express-session')
const config = require('../config/config')
authorRoute.use(session({ secret: config.sessionSecret, saveUninitialized: true, resave: false }))
const authorAuth = require('../middlewares/authorAuth')
const bodyParser = require('body-parser')
authorRoute.use(bodyParser.json())
authorRoute.use(bodyParser.urlencoded({ extended: true }))
authorRoute.set('view engine', 'ejs')
authorRoute.set('views', './views/author')

const multer = require('multer')
const path = require('path')
const authorController = require('../controllers/authorController')

// multer storage
// const storage = multer.diskStorage({
//     destination:'/public/images',
//     filename:(req,file,cb)=>{
//         cb(null,Date.now + file.originalname)
//     }

// })

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/imagess'))
  },
  filename: function (req, file, cb) {
    const name = Date.now() + '-' + file.originalname
    cb(null, name)
  }
})
const upload = multer({
  storage
})

authorRoute.get('/', authorAuth.isLogout, authorController.loadLogin)
authorRoute.post('/', authorController.verifyLogin)

authorRoute.get('/register', authorAuth.isLogout, authorController.loadRegister)
authorRoute.post('/register', authorController.insertAuthor)
authorRoute.get('/verify', authorAuth.isLogout, authorController.verifyMail)

authorRoute.get('/forget', authorAuth.isLogout, authorController.forgetLoad)
authorRoute.post('/forget', authorController.forgetLink)
authorRoute.get('/forget-password', authorAuth.isLogout, authorController.forgetPasswordLoad)
authorRoute.post('/forget-password', authorController.resetPassword)

authorRoute.get('/home', authorAuth.isLogin, authorController.loadDashboard)

authorRoute.get('/products', authorAuth.isLogin, authorController.productLoad)
authorRoute.get('/addproduct', authorAuth.isLogin, authorController.addProductLoad)
authorRoute.post('/addproduct', upload.single('image'), authorController.addProduct)
authorRoute.get('/updateProduct', authorAuth.isLogin, authorController.updateProductLoad)
authorRoute.post('/updateProduct', authorController.updateProduct)
authorRoute.get('/deleteProduct', authorAuth.isLogin, authorController.deleteProduct)

authorRoute.get('/logout', authorController.logout)

authorRoute.get('*', function (req, res) {
  res.redirect('/author')
})

module.exports = authorRoute
