const express = require('express')
const userRoute = express()
const session = require('express-session')
const config = require('../config/config')
userRoute.use(session({
  secret: config.sessionSecret,
  saveUninitialized: true,
  resave: false
}))

userRoute.use((req, res, next) => {
  res.set('cache-control', 'no-store')
  next()
})

const auth = require('../middlewares/auth')

const userController = require('../controllers/userController')
userRoute.set('view engine', 'ejs')
userRoute.set('views', './views/users')
const bodyParser = require('body-parser')
userRoute.use(bodyParser.json())
userRoute.use(bodyParser.urlencoded({ extended: true }))

userRoute.get('/register', auth.isLogout, userController.loadRegister)
userRoute.post('/register', userController.insertUser)
userRoute.get('/verify', auth.isLogout, userController.verifyMail)
userRoute.get('/login', auth.isLogout, userController.loginLoad)
userRoute.get('/', auth.isLogout, userController.loadpage)
userRoute.post('/login', userController.verifyLogin)
userRoute.get('/home', auth.isLogin, userController.loadHome)

userRoute.get('/forget', auth.isLogout, userController.forgetLoad)
userRoute.post('/forget', userController.forgetLink)
userRoute.get('/forget-password', auth.isLogout, userController.forgetPasswordLoad)
userRoute.post('/forget-password', userController.resetPassword)

userRoute.get('/shop', userController.shopLoad)
userRoute.get('/logout', userController.logoutUser)

userRoute.get('/profile', auth.isLogin, userController.profileLoad)

userRoute.get('/product', userController.productLoad)

userRoute.get('/cart', auth.isLogin, userController.cartLoad)
userRoute.get('/add-to-cart', auth.isLogin, userController.addToCart)
userRoute.get('/reduce-from-cart', auth.isLogin, userController.removeFromCart)
// /remove-from-cart
// /move-to-wishlist
// /checkout
// /empty-cart

userRoute.get('/wishlist', auth.isLogin, userController.wishlistLoad)

userRoute.get('/add-to-wishlist', auth.isLogin, userController.addToWishlist)

module.exports = userRoute
