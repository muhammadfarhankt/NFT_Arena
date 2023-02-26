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
userRoute.get('/otp-login', auth.isLogout, userController.otpLogin)
userRoute.post('/otp-login', auth.isLogout, userController.otpLoginVerification)
userRoute.get('/otp-login-verify', auth.isLogout, userController.otpPasswordVerify)
userRoute.post('/otp-login-verify', auth.isLogout, userController.otpPasswordVerifyPost)

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
userRoute.get('/reduce-from-cart', auth.isLogin, userController.reduceFromCart)
userRoute.get('/remove-from-cart', auth.isLogin, userController.removeFromCart)
userRoute.get('/empty-cart', auth.isLogin, userController.emptyCart)
userRoute.get('/move-to-wishlist', auth.isLogin, userController.moveToWishlist)

userRoute.get('/wishlist', auth.isLogin, userController.wishlistLoad)
userRoute.get('/add-to-wishlist', auth.isLogin, userController.addToWishlist)
userRoute.get('/remove-from-wishlist', auth.isLogin, userController.removeFromWishlist)
userRoute.get('/empty-wishlist', auth.isLogin, userController.emptyWishlist)
userRoute.get('/move-to-cart', auth.isLogin, userController.moveToCart)
userRoute.get('/checkout', auth.isLogin, userController.checkout)

module.exports = userRoute
