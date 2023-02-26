const User = require('../models/userModel')
const Category = require('../models/categoryModel')
const Author = require('../models/authorModel')
const bcrypt = require('bcrypt')
const Product = require('../models/productModel')
const multer = require('multer')
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

// admin login
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
    const userData = await User.findOne({ email })
    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password)
      if (passwordMatch) {
        if (userData.isAdmin === false) {
          res.render('login', { message: 'Invalid Credentials' })
        } else {
          req.session.admin_id = userData._id
          res.redirect('/admin/home')
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

const loadDashboard = async (req, res) => {
  try {
    const userData = await User.findById({ _id: req.session.admin_id })
    res.render('home', { admin: userData })
  } catch (error) {
    console.log(error.message)
  }
}

// product loading
const productLoad = async (req, res) => {
  const productData = await Product.find({}).populate('category').populate('author')
  // console.log('product data ' + productData)
  try {
    res.render('products', { productData })
  } catch (error) {
    console.log(error.mesage)
  }
}
// add new product load
const addProductLoad = async (req, res) => {
  try {
    const productData = await Category.find({})
    const authorData = await Author.find({})
    res.render('newproduct', { productData, authorData })
  } catch (error) {
    console.log(error.message)
  }
}
// add new product
const addProduct = async (req, res) => {
  try {
    const product = new Product({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      image: req.file.filename,
      category: req.body.category,
      author: req.body.author,
      stock: req.body.stock,
      isDeleted: false
    })
    const productData = await product.save()
    res.redirect('/admin/products')
  } catch (error) {
    console.log(error.message)
  }
}

// delete product
const deleteProduct = async (req, res) => {
  try {
    const productId = req.query.id
    console.log('product id : ' + productId)
    const productData = await Product.findOne({ _id: productId })
    const value = productData.isDeleted
    console.log(value)
    if (value === false) {
      console.log('false')
      const productDelete = await Product.findByIdAndUpdate({ _id: productId }, { $set: { isDeleted: true } })
      // productData.isDeleted = {$toBool: 1}
      // productData.save()
      res.redirect('/admin/products')
      // console.log(productData)
    } else {
      console.log('true')
      const productDelete = await Product.findByIdAndUpdate({ _id: productId }, { $set: { isDeleted: false } })
      // productData.isDeleted = {$toBool: false}
      // productData.save()
      res.redirect('/admin/products')
    }
    // const deleteData = await Product.findByIdAndUpdate({ _id: productId },{$set:{isDeleted: true}})
    // res.redirect('/admin/products')
  } catch (error) {
    console.log(error.message)
  }
}
// user loading
const userLoad = async (req, res) => {
  try {
    const userData = await User.find({})
    res.render('user', { userData })
  } catch (error) {
    console.log(error.message)
  }
}

// author blocking and unblocking
const blockAuthor = async (req, res) => {
  try {
    const authorId = req.query.id
    console.log('author id for blocking : ' + authorId)
    const authorData = await Author.findOne({ _id: authorId })
    const value = authorData.isBlocked
    console.log(value)
    if (value === true) {
      const authorUpdate = await Author.findByIdAndUpdate({ _id: authorId }, { $set: { isBlocked: false } })
      res.redirect('/admin/author')
    } else if (value === false) {
      const authorUpdate = await Author.findByIdAndUpdate({ _id: authorId }, { $set: { isBlocked: true } })
      res.redirect('/admin/author')
      console.log(authorData)
    }
  } catch (error) {
    console.log(error.message)
  }
}

// user blocking and unblocking
const blockUser = async (req, res) => {
  try {
    const user_id = req.query.id
    console.log(user_id)
    const userData = await User.findOne({ _id: user_id })
    const value = userData.isBlocked
    console.log(value)
    if (value === true) {
      const UserUpdate = await User.findByIdAndUpdate({ _id: user_id }, { $set: { isBlocked: false } })
      res.redirect('/admin/user')
    } else if (value === false) {
      const UserUpdate = await User.findByIdAndUpdate({ _id: user_id }, { $set: { isBlocked: true } })
      res.redirect('user')
      console.log(userData)
    }
  } catch (error) {
    console.log(error.message)
  }
}

// author show
const authorLoad = async (req, res) => {
  try {
    const authorData = await Author.find({})
    res.render('author', { authorData })
  } catch (error) {
    console.log(error.message)
  }
}

// add new author load
const addAuthor = async (req, res) => {
  try {
    res.render('addAuthor')
  } catch (error) {

  }
}

// add new author post
const addAuthorPost = async (req, res) => {
  try {
    const author = new Author({
      name: req.body.name,
      description: req.body.description

    })
    const authorData = await author.save()
    res.redirect('author')
  } catch (error) {
    console.log(error.message)
  }
}

// update author page
const updateAuthorLoad = async (req, res) => {
  try {
    const user_id = req.query.id
    const authorData = await Author.findOne({ _id: user_id })
    console.log(authorData)
    res.render('updateAuthor', { author: authorData })
  } catch (error) {
    console.log(error.mesage)
  }
}

// update author
const updateAuthor = async (req, res) => {
  try {
    const authorId = req.body.id
    const authorupdatedData = await Author.findByIdAndUpdate({ _id: authorId }, { $set: { name: req.body.name, description: req.body.description } })
    res.redirect('/admin/author')
  } catch (error) {
    console.log(error.mesage)
  }
}

// delete category
const deleteAuthor = async (req, res) => {
  try {
    const user_id = req.query.id
    const userData = await Author.findByIdAndDelete({ _id: user_id })
    res.redirect('/admin/author')
  } catch (error) {
    console.log(error.message)
  }
}

// category show
const categoryLoad = async (req, res) => {
  try {
    const categoryData = await Category.find({})
    res.render('category', { categoryData })
  } catch (error) {
    console.log(error.message)
  }
}

// add new category load
const addCategoryLoad = async (req, res) => {
  try {
    res.render('newcategory')
  } catch (error) {

  }
}

// add new category
const addCategory = async (req, res) => {
  try {
    const category = new Category({
      name: req.body.name,
      description: req.body.description

    })
    const categoryData = await category.save()
    res.redirect('category')
  } catch (error) {
    console.log(error.message)
  }
}

// delete category
const deleteCategory = async (req, res) => {
  try {
    const user_id = req.query.id
    const userData = await Category.findByIdAndDelete({ _id: user_id })
    res.redirect('/admin/category')
  } catch (error) {
    console.log(error.message)
  }
}

// update Category page
const updateCategoryLoad = async (req, res) => {
  try {
    const user_id = req.query.id
    const categoryData = await Category.findOne({ _id: user_id })
    console.log(categoryData)
    res.render('updatecategory', { category: categoryData })
  } catch (error) {
    console.log(error.mesage)
  }
}

// update category
const updateCategory = async (req, res) => {
  try {
    const productId = req.body.id
    const categoryupdatedData = await Category.findByIdAndUpdate({ _id: productId }, { $set: { name: req.body.name, description: req.body.description } })
    res.redirect('/admin/category')
  } catch (error) {
    console.log(error.mesage)
  }
}

// logout
const logout = async (req, res) => {
  try {
    req.session.destroy()
    res.redirect('/admin')
  } catch (error) {
    console.log(error.mesage)
  }
}

const updateProductLoad = async (req, res) => {
  try {
    const productId = req.query.id

    console.log('hii')
    const productData = await Product.findOne({ _id: productId }).populate('category').populate('author')
    const authorData = await Author.find({})
    const categoryData = await Category.find({})
    res.render('updateProduct', { productData, authorData, categoryData })
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
    const updateData = await Product.findByIdAndUpdate({ _id: productId }, { $set: { name: req.body.name, description: req.body.description, author: req.body.author, category: req.body.category, price: req.body.price, stock: req.body.stock } })
    res.redirect('/admin/products')
  } catch (error) {
    console.log(error.mesage)
  }
}

module.exports = {
  loadLogin,
  verifyLogin,
  loadDashboard,
  categoryLoad,
  addCategoryLoad,
  addCategory,
  productLoad,
  addProductLoad,
  addProduct,
  deleteProduct,
  userLoad,
  blockUser,
  deleteCategory,
  updateCategoryLoad,
  updateCategory,
  logout,
  updateProductLoad,
  updateProduct,
  authorLoad,
  addAuthor,
  addAuthorPost,
  updateAuthorLoad,
  updateAuthor,
  blockAuthor,
  deleteAuthor
}
