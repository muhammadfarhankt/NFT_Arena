require('dotenv').config()
const User = require('../models/userModel')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const randomstring = require('randomstring')
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const Author = require('../models/authorModel')
const Orders = require('../models/orderModel')
const Banner = require('../models/bannerModel')
// const Offer = require("../models/offerModel")

const { populate } = require('../models/userModel')
const Razorpay = require('razorpay')

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
    const productData = await Product.find({})
    const categoryData = await Category.find({ isBlocked: false, isDeleted: false })
    const authorData = await Author.find({ isBlocked: false, isDeleted: false })
    const bannerData = await Banner.find({})
    console.log('banner dataaaaaaaaaa ' + bannerData[0].image)
    res.render('home', { categoryData, authorData, bannerData, productData })
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
    categoryData = await Category.find({ isBlocked: false, isDeleted: false })
    authorData = await Author.find({ isBlocked: false, isDeleted: false })
    res.render('login', { authorData, categoryData })
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
    const uData = await User.findOne({ email })
    if (uData) {
      if (uData.isVerified === false) {
        res.render('otpLogin', { message: 'Not verified Email yet!. Pls Verify your email' })
      } else {
        // const randomString = randomstring.generate()
        // const updatedData = await User.updateOne({ email }, { $set: { token: randomString } })
        // sendResetMail(userData.name, userData.email, randomString)
        // res.render('otpLogin', { message: 'Pls check your Mail to Reset Password' })
        sendOtpMail(uData.name, uData.email, otp)
        // res.render('otpLogin', { message: 'Pls check your Mail for OTP' })
        req.session.otpUserId = uData._id
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
    uData = await User.findById({ _id: userId })
    res.render('otpLoginVerify', { uData })
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
  if (userOtp == otp) {
    console.log('otp is correct')
    req.session.user_id = userId
    res.redirect('/home')
  } else {
    console.log(' Incorrect OTP')
    res.render('otpLoginVerify', { message: 'Incorrect OTP' })
  }
}

// get home
const loadHome = async (req, res) => {
  try {
    if (req.session.user_id) {
      const userData = await User.findById({ _id: req.session.user_id })
      // console.log('userData')
      console.log(userData)
      const bannerData = await Banner.find({})
      const categoryData = await Category.find({ isBlocked: false, isDeleted: false })
      const productData = await Product.find({})
      console.log(categoryData)
      res.render('home', { userData, categoryData, bannerData, productData })
    } else {
      res.redirect('/login')
    }
  } catch (error) {
    console.log(error.message)
  }
}

// // logout
// const userLogout = async (req, res) => {
//   try {
//     req.session.user_id = ''
//     res.redirect('/')
//   } catch (error) {
//     console.log(error.message)
//   }
// }

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
    const page = req.query.page || 1
    const productList = await Product.find({ isDeleted: false, isBlocked: false }).populate('category').populate('author')
    const categoryData = await Category.find({ isBlocked: false, isDeleted: false })
    const authorData = await Author.find({ isBlocked: false, isDeleted: false })
    const productsPerPage = 4
    const startIndex = (page - 1) * productsPerPage
    const endIndex = startIndex + productsPerPage
    const pageProducts = productList.slice(startIndex, endIndex)
    const totalPages = Math.ceil(productList.length / productsPerPage)

    if (req.session.user_id) {
      const userData = await User.findById({ _id: req.session.user_id })
      res.render('shop', { userData, categoryData, authorData, pageProducts, totalPages, currentPage: parseInt(page, 10) })
    } else {
      res.render('shop', { categoryData, authorData, pageProducts, totalPages, currentPage: parseInt(page, 10) })
    }
  } catch (error) {
    console.log(error.message)
  }
}

const categoryLoad = async (req, res) => {
  // res.render('category')
  const categoryData = await Category.find({ isBlocked: false, isDeleted: false })
  const authorData = await Author.find({ isBlocked: false, isDeleted: false })
  const singleCategory = await Category.findById({ _id: req.query.id })
  const categoryProducts = await Product.find({ category: req.query.id, isDeleted: false }).populate('author')
  // console.log('single category ' + singleCategory)
  // console.log(' category products ' + categoryProducts)
  if (req.session.user_id) {
    // console.log('user data true')
    const userData = await User.findById({ _id: req.session.user_id })
    res.render('category', { singleCategory, categoryData, authorData, userData, categoryProducts })
  } else {
    // console.log('user data false')
    res.render('category', { singleCategory, categoryData, authorData, categoryProducts })
  }
}

const authorLoad = async (req, res) => {
  const categoryData = await Category.find({ isBlocked: false, isDeleted: false })
  const authorData = await Author.find({ isBlocked: false, isDeleted: false })
  const singleAuthor = await Author.findById({ _id: req.query.id })
  const authorProducts = await Product.find({ author: req.query.id, isDeleted: false, isBlocked: false }).populate('category')
  // console.log('single author ' + singleAuthor)
  // console.log(' category products ' + categoryProducts)
  if (req.session.user_id) {
    const userData = await User.findById({ _id: req.session.user_id })
    res.render('author', { singleAuthor, authorProducts, categoryData, authorData, userData })
  } else {
    res.render('author', { singleAuthor, authorProducts, categoryData, authorData })
  }
}

// logout
const logoutUser = async (req, res) => {
  try {
    req.session.user_id = ''
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

// update user profile /updateProfile
const saveUserDetails = async (req, res) => {
  try {
    const { name, mobile, address, city, state, zip } = req.body

    await User.findByIdAndUpdate({ _id: req.session.user_id }, { $set: { name, mobile, address, city, state, zip } })

    res.redirect('/profile')
  } catch (error) {
    console.log(error.message);
  }
}

// list orders orderLoad
const orderLoad = async (req, res) => {
  try {
    const userData = await User.findById({ _id: req.session.user_id })
    const orderData = await Orders.find({ userId: req.session.user_id })
    res.render('orders', { userData, orderData })
  } catch (error) {
    console.log('orders load error')
  }
}

// cancel order
const cancelOrder = async (req, res) => {
  try {
    const orderId = req.query.id
    await Orders.findOneAndUpdate({ _id: orderId }, { $set: { status: 'Cancelled' } })
    await Orders.findOneAndUpdate({ _id: orderId }, { $set: { isorder: false } })
    res.redirect('/orders')
  } catch (error) {
    console.log('order cancel error')
  }
}

const getSingleOrderView = async (req, res) => {
  try {
    const orderId = req.query.id
    const userData = await User.findById({ _id: req.session.user_id })
    const categoryData = await Category.find({ isBlocked: false, isDeleted: false })
    const authorData = await Author.find({ isBlocked: false, isDeleted: false })
    const orderData = await Orders.findOne({ _id: orderId })
    const populatedData = await orderData.populate('products.item.productId')
    res.render('singleOrderView', { userData, categoryData, authorData, orderData, populatedData })
  } catch (error) {
    console.log(error.message);
  }
}

let totalCartPrice = 0
// load checkout page
const checkoutLoad = async (req, res) => {
  try {
    const userData = await User.findById({ _id: req.session.user_id })
    totalCartPrice = userData.cart.totalPrice
    console.log('total cart price frommmmmmmm chekout ' + totalCartPrice)
    res.render('checkout', { userData })
  } catch (error) {
    console.log('erroooorrr checkouuuuutttttttttt page')
  }
}

const createOrder = async (req, res) => {
  try {
    const userData = await User.findById({ _id: req.session.user_id })
    // await Coupons.updateOne({ value: req.body.value }, { $push: { coustomer: req.session.userid } });
    const populatedData = await userData.populate('cart.item.productId')
    const productData = await Product.find({})
    let order
    if (req.body.currentAddress) {
      const { _id, country, address, city, state, zip, phonenumber, email } = userData
      order = new Orders({
        userId: req.session.user_id,
        name: userData.name,
        country,
        address,
        city,
        state,
        zip,
        phone: phonenumber,
        email,
        products: populatedData.cart,
        payment: req.body.payment,
        sellingPrice: totalCartPrice
      })
    } else if (req.body.address) {
      const { name, country, address, city, state, zip, phone, email, payment } = req.body;
      order = new Orders({
        userId: req.session.user_id,
        name,
        country,
        address,
        city,
        state,
        zip,
        phone,
        email,
        products: populatedData.cart,
        payment,
        sellingPrice: totalCartPrice
      })
    } else {
      // req.flash('message', 'Please Fill The Form')
      console.log('please fil form')
      return res.render('checkout', { userData, message: 'Please Select Address or Fill Address Form' })
    }
    if (!req.body.payment) {
      // req.flash('message', 'Please Select either one of the payment modes')
      console.log('pls select payemeeentttt methooooddd')
      return res.render('checkout', { userData, message: 'Please Select either one of the payment modes' })
    }
    const orderData = await order.save()
    req.session.currentOrderId = orderData._id
    console.log('current order id ' + req.session.currentOrderId)

    console.log('order data after save ' + orderData)
    if (orderData) {
      // await User.updateOne({ _id: req.session.user_id }, { cart: {} })
      let afterPrice = 0 
      let isApplied = 0
      console.log(req.body.payment);
      if (req.body.payment == 'Cash on delivery') {
        // console.log(' cart length ' + userData.cart.item.length)
        res.redirect('/orderSuccess')
      } else if (req.body.payment == 'Razorpay') {
        res.redirect('/payment')
      } else {
        res.redirect('/checkout')
      }
    } else {
      res.redirect('/checkout')
    }
  } catch (error) {
    console.log(error.message);
  }
}

// ordered successfully
const orderSuccess = async (req, res) => {
  const categoryData = await Category.find({ isBlocked: false, isDeleted: false })
  const authorData = await Author.find({ isBlocked: false, isDeleted: false })
  const userData = await User.findById({ _id: req.session.user_id })
  for (let j = 0; j < userData.cart.item.length; j++) {
    let singleId = userData.cart.item[j].productId
    let singleProduct = await Product.findOne({ _id: singleId })
    // await Product.findByIdAndUpdate({_id: singleId}, {$set: { quantity: cart.item[i].quantity}})
    console.log('single product detailssssss' + singleProduct)
    singleProduct.stock -= userData.cart.item[j].quantity
    singleProduct.save()
    console.log('single product detailssssss' + singleProduct)
  }
  userData.cart.item = []
  userData.cart.totalPrice = 0
  userData.save()
  // console.log('current order id ' + req.session.currentOrderId)
  await Orders.updateOne({ userId: req.session.user_id, _id: req.session.currentOrderId}, { $set: { status: 'Success' } })
  res.render('orderSuccess', { userData, categoryData, authorData })
}

// ordered successfully
const orderFailed = async (req, res) => {
  const categoryData = await Category.find({ isBlocked: false, isDeleted: false })
  const authorData = await Author.find({ isBlocked: false, isDeleted: false })
  const userData = await User.findById({ _id: req.session.user_id })
  res.render('orderFailed', { userData, categoryData, authorData })
}

// product Load
const productLoad = async (req, res) => {
  try {
    const productId = req.query.id
    categoryData = await Category.find({ isBlocked: false, isDeleted: false })
    authorData = await Author.find({ isBlocked: false, isDeleted: false })
    const productDetails = await Product.findById({ _id: productId }).populate('category').populate('author')
    console.log('product details ::::::::::::::  ' + productDetails)
    if (req.session.user_id) {
      const userData = await User.findById({ _id: req.session.user_id })
      res.render('product', { productDetails, userData, authorData, categoryData })
    } else {
      res.render('product', { productDetails, authorData, categoryData })
    }
  } catch (error) {
    console.log(error.message)
  }
}

// ----------------------------- Razor Pay  ----------------------------------------------------//

const loadPayment = async (req, res) => {
  try {
    const userId = req.session.user_id
    const userData = await User.findById({ _id: userId })
    const categoryData = await Category.find({ isBlocked: false, isDeleted: false })
    const authorData = await Author.find({ isBlocked: false, isDeleted: false })
    res.render('payment', { userData, categoryData, authorData })
  } catch (error) {
    console.log(error.message);
  }
}

const razorpayCheckout = async (req, res) => {
  try {
    console.log('razor pay post')
    const userData = await User.findById({ _id: req.session.user_id })
    const completeUser = await userData.populate('cart.item.productId')
    let instance = new Razorpay({ key_id: process.env.razorPayId, key_secret: process.env.razorPaySecret })
    console.log('razir pay id : ' + process.env.razorPayId + '   razor pay secret : : ' + process.env.razorPaySecret)
    console.log(' instanceeeeeeeeeeeeeeeee  ' + instance)
    let order = await instance.orders.create({
      amount: totalCartPrice * 100,
      currency: "INR",
      receipt: 'receipt#1'
    })
    console.log(' rzor pay order ' + order)
    res.status(201).json({
      success: true,
      order
    })
  } catch (error) {
    console.log(error.message);
  }
}

// ---------------------------------End Razor Pay -----------------------------------------------//

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
  // console.log('product Index : ' + productIndex)
  // console.log('total price : ' + userData.cart.totalPrice)
  // userData.cart.totalPrice -= parseInt(userData.cart.item[productIndex].price * userData.cart.item[productIndex].quantity)
  // console.log('new total price : ' + userData.cart.totalPrice)
  // console.log('product price : ' + userData.cart.item[productIndex].price)
  // userData.cart.item.splice(productIndex, 1)
  // await userData.save()
  // res.redirect('/cart')
  const productId = req.query.id
  const userData = await User.findById({ _id: req.session.user_id })
  const productIndex = await userData.cart.item.findIndex((p) => p.productId == productId)
  console.log('product Index : ' + productIndex)
  console.log('product quantity : ' + userData.cart.item[productIndex].quantity)
  const qty = { a: parseInt(userData.cart.item[productIndex].quantity) }
  console.log('qty a  :  ' + qty.a)
  userData.cart.item[productIndex].quantity = qty.a
  userData.cart.totalPrice -= userData.cart.item[productIndex].price * userData.cart.item[productIndex].quantity
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
  categoryLoad,
  authorLoad,
  logoutUser,
  profileLoad,
  saveUserDetails,
  orderLoad,
  checkoutLoad,
  createOrder,
  orderSuccess,
  orderFailed,
  cancelOrder,
  getSingleOrderView,
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
  checkout,
  loadPayment,
  razorpayCheckout
}
