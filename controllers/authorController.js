const Author = require('../models/authorModel')
const Category = require('../models/categoryModel')
const nodemailer = require('nodemailer')

const bcrypt = require('bcrypt')
const Product = require('../models/productModel')
// const multer = require('multer')
// const bodyParser = require('body-parser');
const randomstring = require('randomstring')
const { find } = require('../models/userModel')

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 7)
    return passwordHash
  } catch (error) {
    console.log(error.message)
  }
}

// author login
const loadLogin = async (req, res) => {
  try {
    res.render('login')
  } catch (error) {
    console.log(error.message)
  }
}

// verify login
const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email
    const password = req.body.password
    const authorData = await Author.findOne({ email })
    if (authorData) {
      const passwordMatch = await bcrypt.compare(password, authorData.password)
      if (passwordMatch) {
        if (authorData.isAdmin === false) {
          res.render('login', { message: 'Invalid Credentials' })
        } else {
          req.session.author_id = authorData._id
          res.redirect('/author/home')
        }
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

// load author dashboard
const loadDashboard = async (req, res) => {
  try {
    console.log('loadDashboard')
    const authorData = await Author.findById({ _id: req.session.author_id })
    console.log('authorData')
    console.log(authorData)
    res.render('home', { author: authorData })
  } catch (error) {
    console.log(error.message)
  }
}

// product loading
const productLoad = async (req, res) => {
  const authorId = req.session.author_id
  console.log('authorId :  ' + authorId)
  const authorName = await Author.findOne({ _id: authorId })
  console.log('Author Name :  ' + authorName)
  const productData = await Product.find({ author: authorName.name })
  console.log('product data ' + productData)
  try {
    res.render('products', { productData })
  } catch (error) {
    console.log(error.mesage)
  }
}

// add new product load
const addProductLoad = async (req, res) => {
  try {
    const authorId = req.session.author_id
    const productData = await Category.find({})
    const authorData = await Author.findOne({ _id: authorId })
    console.log(authorData.name)
    res.render('newproduct', { productData, authorData })
  } catch (error) {
    console.log(error.message)
  }
}

// add new product
const addProduct = async (req, res) => {
  try {
    console.log('try add product')
    const product = new Product({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      image: req.file.filename,
      category: req.body.category,
      author: req.body.author
    })
    const productData = await product.save()
    res.redirect('/author/products')
  } catch (error) {
    console.log(error.message)
  }
}

// delete product
const deleteProduct = async (req, res) => {
  try {
    const productId = req.query.id
    const deleteData = await Product.findByIdAndDelete({ _id: productId })
    res.redirect('/author/products')
  } catch (error) {
    console.log(error.message)
  }
}

// logout
const logout = async (req, res) => {
  try {
    req.session.destroy()
    res.redirect('/author')
  } catch (error) {
    console.log(error.mesage)
  }
}

const updateProductLoad = async (req, res) => {
  try {
    const productId = req.query.id
    console.log('hii')
    const productData = await Product.findOne({ _id: productId })
    res.render('updateProduct', { productData })
  } catch (error) {
    console.log(error.message)
  }
}

// update product
const updateProduct = async (req, res) => {
  try {
    const productId = req.body.id
    console.log('try')
    console.log(productId)
    const updateData = await Product.findByIdAndUpdate({ _id: productId }, { $set: { name: req.body.name, description: req.body.description, price: req.body.price } })
    res.redirect('/author/products')
  } catch (error) {
    console.log(error.mesage)
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

// Adding author
const insertAuthor = async (req, res) => {
  try {
    const checkEmail = await Author.findOne({ email: req.body.email })
    const checkNumber = await Author.findOne({ mobile: req.body.mobile })
    if (checkEmail) {
      res.render('registration', { message: 'Email is already registered' })
    } else if (checkNumber) {
      res.render('registration', { message: ' Mobile is already registered' })
    } else {
      const spassword = await securePassword(req.body.password)

      const author = new Author({
        name: req.body.name,
        email: req.body.email,
        mobile: req.body.mobile,
        password: spassword

      })
      const authorData = await author.save()

      if (authorData) {
        sendVerifyMail(req.body.name, req.body.email, authorData._id)

        res.render('registration', { message: 'Registration succesful, Please verify your email!' })
      } else {
        res.render('registration', { message: 'Registartion failed!' })
      }
    }
  } catch (error) {
    console.log(error.message)
  }
}

// for verify mail send
const sendVerifyMail = async (name, email, userId) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: 'farhanlatheefkt@gmail.com',
        pass: 'ajpufjrzcbapiuzw'
      }
    })
    const mailOptions = {
      from: 'farhanlatheefkt@gmail.com',
      to: email,
      subject: 'Verify your NFT Arena Account',
      html: '<p> Hello Mr. ' + name + ' , Plesase Click  <a href="http://localhost:3000/author/verify?id=' + userId + '"> here to verify </a> your Author account</p>'
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

// verifying mail
const verifyMail = async (req, res) => {
  try {
    const updateInfo = await Author.updateOne({ _id: req.query.id }, { $set: { isVerified: true } })
    console.log(updateInfo)
    res.render('email-verified')
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
    const authorData = await Author.findOne({ email })
    if (authorData) {
      if (authorData.isVerified === false) {
        res.render('forget', { message: 'Not verified Email yet!. Pls Verify your email' })
      } else {
        const randomString = randomstring.generate()
        const updatedData = await Author.updateOne({ email }, { $set: { token: randomString } })
        sendResetMail(authorData.name, authorData.email, randomString)
        res.render('forget', { message: 'Pls check your Mail to Reset Password' })
      }
    } else {
      res.render('forget', { message: 'There is no account linked with this email' })
    }
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
        user: 'farhanlatheefkt@gmail.com',
        pass: 'ajpufjrzcbapiuzw'
      }
    })
    const mailOptions = {
      from: 'farhanlatheefkt@gmail.com',
      to: email,
      subject: 'Reset your NFT Arena account password',
      html: '<p> Hello  Mr.  ' + name + ' , Please Click  <a href="http://localhost:3000/author/forget-password?token=' + token + '">  here to reset </a> your NFT Arena account password</p>'
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

const forgetPasswordLoad = async (req, res) => {
  try {
    const token = req.query.token
    const tokenData = await Author.findOne({ token })
    console.log(tokenData)
    if (tokenData) {
      res.render('forget-password', { userId: tokenData })
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
    const userId = req.body.user_id
    console.log(userId)
    const sPassword = await securePassword(password)
    const updatedData = await Author.findByIdAndUpdate({ _id: userId }, { $set: { password: sPassword, token: '' } })
    res.render('forget success', { message: 'Password Updated Succesfully' })
    console.log(updatedData)
  } catch (error) {
    console.log(error.message)
  }
}

module.exports = {
  loadLogin,
  verifyLogin,
  loadDashboard,
  productLoad,
  addProductLoad,
  addProduct,
  deleteProduct,
  logout,
  updateProductLoad,
  updateProduct,
  loadRegister,
  insertAuthor,
  verifyMail,
  forgetLoad,
  forgetLink,
  forgetPasswordLoad,
  resetPassword
}
