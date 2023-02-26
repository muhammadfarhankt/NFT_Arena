require('dotenv').config()
const User = require('../models/userModel')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const randomstring = require('randomstring')
const Product = require('../models/productModel')
const { populate } = require('../models/userModel')

const otpGenerator = require('otp-generator')

//  function for making password secure
const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10)
    return passwordHash
  } catch (error) {
    console.log(error.message)
  }
}

// for mail send
const sendVerifyMail = async (name, email, user_id) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.myemail,
        pass: process.env.mypassword
      }
    })
    const mailOptions = {
      from: process.env.myemail,
      to: email,
      subject: 'Verify your NFT Arena Account',
      html: '<p> Hello Mr. ' + name + ' , Plesase Click  <a href="http://localhost:3000/verify?id=' + user_id + '"> here to verify </a> your NFT Arena account</p>'
    }
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error)
      } else {
        console.log('email has been send', info.response)
      }
    })
  } catch (error) {
    console.log(error.message)
  }
}

// for reset password
const sendResetMail = async (name, email, token) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.myemail,
        pass: process.env.mypassword
      }
    })
    const mailOptions = {
      from: process.env.myemail,
      to: email,
      subject: 'Reset your NFT Arena account password',
      html: '<p> Hello  Mr.  ' + name + ' , Please Click  <a href="http://localhost:3000/forget-password?token=' + token + '">  here to reset </a> your NFT Arena account password</p>'
    }
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error)
      } else {
        console.log('email has been send', info.response)
      }
    })
  } catch (error) {
    console.log(error.message)
  }
}

// for otp login
let otp = otpGenerator.generate(6, { digits: true, upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false })
const sendOtpMail = async (name, email, otp) => {
  try {
    console.log('Name : ' + name + 'email : ' + email + 'otp : ' + otp)
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.myemail,
        pass: process.env.mypassword
      }
    })
    const mailOptions = {
      from: process.env.myemail,
      to: email,
      subject: 'OTP for your NFT Arena account',
      html: '<p> Hello  Mr.  ' + name + '. Your Login OTP is    ' + otp + '   . Pls donot share OTP with anyone else.'
    }
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error)
      } else {
        console.log('email has been send', info.response)
      }
    })
  } catch (error) {
    console.log(error.message)
  }
}

// loading loadpage
const loadpage = async (req, res) => {
  try {
    res.render('home')
  } catch (error) {
    console.log(error.message)
  }
}

// loading registration form
const loadRegister = async (req, res) => {
  try {
    res.render('registration')
  } catch (error) {
    console.log(error.message)
  }
}

// Adding user
const insertUser = async (req, res) => {
  try {
    const checkEmail = await User.findOne({ email: req.body.email })
    const checkNumber = await User.findOne({ mobile: req.body.mobile })
    if (checkEmail) {
      res.render('registration', { message: 'Email is already registered' })
    } else if (checkNumber) {
      res.render('registration', { message: ' Mobile is already registered' })
    } else {
      const spassword = await securePassword(req.body.password)

      const user = new User({
        name: req.body.name,
        email: req.body.email,
        mobile: req.body.mobile,
        password: spassword

      })
      const userData = await user.save()

      if (userData) {
        sendVerifyMail(req.body.name, req.body.email, userData._id)

        res.render('registration', { message: 'Registration succesful, Please verify your email!' })
      } else {
        res.render('registration', { message: 'Registartion failed!' })
      }
    }
  } catch (error) {
    console.log(error.message)
  }
}

// verifying mail
const verifyMail = async (req, res) => {
  try {
    const updateInfo = await User.updateOne({ _id: req.query.id }, { $set: { isVerified: true } })

    console.log(updateInfo)
    res.render('email-verified')
  } catch (error) {
    console.log(error.message)
  }
}

// loading login page
const loginLoad = async (req, res) => {
  try {
    res.render('login')
  } catch (error) {
    console.log(error.message)
  }
}

// login verify
const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email
    const password = req.body.password
    const userData = await User.findOne({ email })
    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password)
      if (passwordMatch && userData.isVerified === true && userData.isBlocked === false && userData.isAdmin === false && userData.isDeleted === false) {
        req.session.user_id = userData._id
        res.redirect('/home')
      } else if (userData.isBlocked === true) {
        res.render('login', { message: 'Your account has been blocked, Pls Contact admin' })
      } else if (userData.isVerified === false) {
        res.render('login', { message: 'Your account has not verified yet, Pls verify' })
      } else if (userData.isDeleted === true) {
        res.render('login', { message: 'Your account has been deleted, Pls create new one' })
      } else {
        res.render('login', { message: 'Invalid Credentials' })
      }
    } else {
      res.render('login', { message: 'Invalid Credentials' })
    }
  } catch (error) {
    console.log(error.message)
  }
}

// otp login
const otpLogin = async (req, res) => {
  try {
    console.log('otp          :     ' + otp)
    res.render('otpLogin')
  } catch (error) {
    console.log(error.message)
  }
}

// otp login verification
const otpLoginVerification = async (req, res) => {
  try {
    const email = req.body.email
    const userData = await User.findOne({ email })
    if (userData) {
      if (userData.isVerified === false) {
        res.render('otpLogin', { message: 'Not verified Email yet!. Pls Verify your email' })
      } else {
        // const randomString = randomstring.generate()
        // const updatedData = await User.updateOne({ email }, { $set: { token: randomString } })
        // sendResetMail(userData.name, userData.email, randomString)
        // res.render('otpLogin', { message: 'Pls check your Mail to Reset Password' })
        sendOtpMail(userData.name, userData.email, otp)
        // res.render('otpLogin', { message: 'Pls check your Mail for OTP' })
        req.session.otpUserId = userData._id
        res.redirect('/otp-login-verify')
      }
    } else {
      res.render('otpLogin', { message: 'There is no account linked with this email' })
    }
  } catch (error) {
    console.log(error.message)
  }
}

const otpPasswordVerify = async (req, res) => {
  try {
    userId = req.session.otpUserId
    userData = await User.findById({ _id: userId })
    res.render('otpLoginVerify', { userData })
  } catch (error) {
    console.log(error.message)
  }
}

const otpPasswordVerifyPost = async (req, res) => {
  console.log('otpPasswordVerifyPost')
  userId = req.body.id
  userOtp = req.body.otp
  console.log('userId ' + userId)
  console.log('user otp : ' + userOtp + '    otp   :  + ' + otp)
  if ( userOtp == otp) {
    console.log('otp is correct')
    req.session.user_id = userId
    res.redirect('/home')
  } else {
    console.log(' Incorrect OTP')
    res.render('otpLoginVerify', { message: 'Incorrect OTP'})
  }
}

// get home
const loadHome = async (req, res) => {
  try {
    if (req.session.user_id) {
      const userData = await User.findById({ _id: req.session.user_id })
      // console.log('userData')
      console.log(userData)
      res.render('home', { userData })
    } else {
      res.redirect('/login')
    }
  } catch (error) {
    console.log(error.message)
  }
}

// logout
const userLogout = async (req, res) => {
  try {
    req.session.destroy()
    res.redirect('/')
  } catch (error) {
    console.log(error.message)
  }
}

// forget password
const forgetLoad = async (req, res) => {
  try {
    res.render('forget')
  } catch (error) {
    console.log(error.message)
  }
}

// forget link
const forgetLink = async (req, res) => {
  try {
    const email = req.body.email
    const userData = await User.findOne({ email })
    if (userData) {
      if (userData.isVerified === false) {
        res.render('forget', { message: 'Not verified Email yet!. Pls Verify your email' })
      } else {
        const randomString = randomstring.generate()
        const updatedData = await User.updateOne({ email }, { $set: { token: randomString } })
        sendResetMail(userData.name, userData.email, randomString)
        res.render('forget', { message: 'Pls check your Mail to Reset Password' })
      }
    } else {
      res.render('forget', { message: 'There is no account linked with this email' })
    }
  } catch (error) {
    console.log(error.message)
  }
}

const forgetPasswordLoad = async (req, res) => {
  try {
    const token = req.query.token
    const tokenData = await User.findOne({ token })
    console.log(tokenData)
    if (tokenData) {
      res.render('forget-password', { user_id: tokenData })
    } else {
      res.render('404', { message: 'Token is invalid' })
    }
  } catch (error) {
    console.log(error.message)
  }
}

const resetPassword = async (req, res) => {
  try {
    const password = req.body.password
    const user_id = req.body.user_id
    console.log(user_id)
    const sPassword = await securePassword(password)
    const updatedData = await User.findByIdAndUpdate({ _id: user_id }, { $set: { password: sPassword, token: '' } })
    res.render('forget success', { message: 'Password Updated Succesfully' })
    console.log(updatedData)
  } catch (error) {
    console.log(error.message)
  }
}

// shopLoad
const shopLoad = async (req, res) => {
  try {
    const productList = await Product.find({})
    if (req.session.user_id) {
      const userData = await User.findById({ _id: req.session.user_id })
      res.render('shop', { productList, userData })
    } else {
      res.render('shop', { productList })
    }
  } catch (error) {
    console.log(error.message)
  }
}

// logout
const logoutUser = async (req, res) => {
  try {
    req.session.destroy()
    res.redirect('/')
  } catch (error) {
    console.log(error.message)
  }
}

// Profile Load
const profileLoad = async (req, res) => {
  try {
    const userData = await User.findById({ _id: req.session.user_id })
    console.log('userData')
    console.log(userData)
    res.render('profile', { userData })
  } catch (error) {
    console.log(error.message)
  }
}

// product Load
const productLoad = async (req, res) => {
  try {
    const productId = req.query.id
    const productDetails = await Product.findById({ _id: productId })
    if (req.session.user_id) {
      const userData = await User.findById({ _id: req.session.user_id })
      res.render('product', { productDetails, userData })
    } else {
      res.render('product', { productDetails })
    }
  } catch (error) {
    console.log(error.message)
  }
}

// -------------------------------------------------Start Cart----------------------------------//
// load cart
const cartLoad = async (req, res) => {
  try {
    const userData = await User.findById({ _id: req.session.user_id })
    console.log('userData')
    console.log(userData)
    res.render('cart', { userData })
  } catch (error) {
    console.log(error.message)
  }
}

// add to Cart
const addToCart = async (req, res) => {
  try {
    const productId = req.query.id
    const productData = await Product.findById({ _id: productId })
    // console.log('product id  ' + productId)
    const userId = req.session.user_id
    // console.log(userId)
    const userData = await User.findById({ _id: userId })
    console.log('user data :  ' + userData)
    userData.addToCart(productData)
    res.redirect('/cart')
  } catch (error) {
    console.log('add to cart error')
  }
}

// reduce  item from cart
const reduceFromCart = async (req, res) => {
  const productId = req.query.id
  const userData = await User.findById({ _id: req.session.user_id })
  const productIndex = await userData.cart.item.findIndex((p) => p.productId == productId)
  console.log('product Index : ' + productIndex)
  userData.cart.item[productIndex].quantity -= 1
  userData.cart.totalPrice -= userData.cart.item[productIndex].price
  if (userData.cart.item[productIndex].quantity === 0) {
    userData.cart.item.splice(productIndex, 1)
  } else {
    const qty = { a: parseInt(userData.cart.item[productIndex].quantity) }
    userData.cart.item[productIndex].quantity = qty.a
  }
  console.log('total price  after : ' + userData.cart.totalPrice)
  await userData.save()
  res.redirect('/cart')
}

// removing an item from cart
const removeFromCart = async (req, res) => {
  console.log('product Index : ' + productIndex)
  console.log('total price : ' + userData.cart.totalPrice)
  userData.cart.totalPrice -= parseInt(userData.cart.item[productIndex].price * userData.cart.item[productIndex].quantity)
  console.log('new total price : ' + userData.cart.totalPrice)
  console.log('product price : ' + userData.cart.item[productIndex].price)
  userData.cart.item.splice(productIndex, 1)
  await userData.save()
  res.redirect('/cart')
}

const emptyCart = async (req, res) => {
  const userData = await User.findById({ _id: req.session.user_id })
  userData.cart.item.splice(0, userData.cart.item.length)
  userData.cart.totalPrice = 0
  await userData.save()
  res.redirect('/cart')
}

// move an item from cart to wishlist
const moveToWishlist = async (req, res) => {
  console.log('move to wishlist')
  const productId = req.query.id
  const userData = await User.findById({ _id: req.session.user_id })
  const productIndex = await userData.cart.item.findIndex((p) => p.productId == productId)
  const wishList = await userData.addWishlist(req.query.id)
  userData.cart.totalPrice -= parseInt(userData.cart.item[productIndex].price * userData.cart.item[productIndex].quantity)
  userData.cart.item.splice(productIndex, 1)
  await userData.save()
  res.redirect('/cart')
}
// ----------------------------- End Cart---------------------------------------------//

// -----------------------------Start Wish List----------------------------------------//
// wishlist load
const wishlistLoad = async (req, res) => {
  try {
    const userData = await User.findById({ _id: req.session.user_id })
    console.log('userData   :  ' + userData)
    const populatedData = await userData.populate('wishlist.item.productId')
    console.log('populated data : ' + populatedData)
    res.render('wishlist', { userData, wishListData: populatedData.wishlist })
  } catch (error) {
    console.log(error.message)
  }
}

// add product to wishlist
const addToWishlist = async (req, res) => {
  try {
    const productId = req.query.id
    const userId = req.session.user_id
    console.log(productId)
    console.log(userId)
    const userData = await User.findById({ _id: userId })
    console.log('wish list' + userData.wishList)
    const wishList = await userData.addWishlist(req.query.id)
    console.log(wishList)
    res.redirect('/wishlist')
  } catch (error) {
    console.log('add to wish list catch error')
  }
}

// remove an item from wishlist
const removeFromWishlist = async (req, res) => {
  const productId = req.query.id
  userData = await User.findById({ _id: req.session.user_id })

  // console.log(userData)
  const wishListIndex = await userData.wishlist.item.findIndex((x) => x.productId == productId)
  console.log('wish list index  :  ' + wishListIndex)
  userData.wishlist.item.splice(wishListIndex, 1)

  userData.save()
  res.redirect('/wishlist')
}

// empty wishlist
const emptyWishlist = async (req, res) => {
  userData = await User.findById({ _id: req.session.user_id })
  userData.wishlist.item.splice(0, userData.wishlist.item.length)
  userData.save()
  res.redirect('/wishlist')
}

// move an item from wishlist to cart
const moveToCart = async (req, res) => {
  console.log('move to cart')
  const productId = req.query.id
  productData = await Product.findById({ _id: productId })
  userData = await User.findById({ _id: req.session.user_id })
  const wishListIndex = await userData.wishlist.item.findIndex((x) => x.productId == productId)
  userData.wishlist.item.splice(wishListIndex, 1)
  userData.addToCart(productData)
  res.redirect('/wishlist')
}

// ---------------------------------------------End Wish List ------------------------------------------------//

const checkout = async (req, res) => {
  console.log('checkout')
}

// exporting modules
module.exports = {
  loadpage,
  loadRegister,
  insertUser,
  verifyMail,
  loginLoad,
  verifyLogin,
  otpLogin,
  otpLoginVerification,
  otpPasswordVerify,
  otpPasswordVerifyPost,
  loadHome,
  forgetLoad,
  forgetLink,
  forgetPasswordLoad,
  resetPassword,
  shopLoad,
  logoutUser,
  profileLoad,
  productLoad,
  cartLoad,
  addToCart,
  reduceFromCart,
  removeFromCart,
  emptyCart,
  moveToWishlist,
  wishlistLoad,
  addToWishlist,
  removeFromWishlist,
  emptyWishlist,
  moveToCart,
  checkout
}
