const User = require('../models/userModel')
const Category = require('../models/categoryModel')
const Author = require('../models/authorModel')
const bcrypt = require('bcrypt')
const Product = require('../models/productModel')
const Banner = require('../models/bannerModel')
const Order = require('../models/orderModel')
const Offer = require("../models/offerModel")
const multer = require('multer')
// const bodyParser = require('body-parser');
const randomstring = require('randomstring')
const { find } = require('../models/userModel')
const excelJs = require('exceljs')
const objectId = require('mongodb').ObjectId
const { ObjectId } = require("mongodb")

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
    // const orderNumber = await Order.find({})
    const orderCount = await Order.countDocuments()
    const userCount = await User.countDocuments()
    const authorCount = await Author.countDocuments()
    const productCount = await Product.countDocuments()
    const categoryCount = await Category.countDocuments()
    const bannerCount = await Banner.countDocuments()
    // const couponCount = await Coupon.countDocuments()
    const total = await Order.aggregate([
      { $match: { status: 'Success' } },
      {
        $group: {
          _id: null,
          total: { $sum: '$sellingPrice' }
        }
      }
    ], (err, result) => {
      if (err) {
        console.error(err)
      } else {
        const total = result[0].total
        console.log('Sum of all order amount:', total)
        return total
      }
    })
    const totalAmount = total[0].total
    const orderDataDaily = await Order.aggregate([
      {
        $group: {
          _id: { $dayOfWeek: { date: "$createdAt" } },
          amount: { $sum: "$sellingPrice" },
        },
      },
    ])

    const a = orderDataDaily.map((x) => x._id)
    const amount = orderDataDaily.map((x) => x.amount)
    // console.log('Sum of all orders', total[0].total)
    // let orderNumber = await User.count({}, function(count){ return count})
    // const orders = orderNumber.count()
    // console.log('order count : ' + orderNumber)

    res.render('home', { admin: userData, orderCount, userCount, totalAmount: 0, authorCount, productCount, total, categoryCount, bannerCount, couponCount: 40, amount })
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

// -----------------------------------------------Reports and charts  start --------------------------------------------------------------//

const downloadSalesReport = async function (req, res) {
  try {
    const workBook = new excelJs.Workbook()
    const workSheet = workBook.addWorksheet('My Order')
    workSheet.columns = [
      { header: 'Order Id', key: '_id' },
      { header: 'User Name', key: 'name' },
      { header: 'Amount', key: 'sellingPrice' },
      { header: 'Payment Type', key: 'payment' },
      { header: 'Status', key: 'status' },
      { header: 'Date', key: 'createdAt' },
      { header: 'Address', key: 'address' },
      { header: 'City', key: 'city' },
      { header: 'State', key: 'state' },
      { header: 'ZIP', key: 'zip' }
    ]

    let counter = 1

    const orderData = await Order.find({})

    orderData.forEach(function (order) {
      order.s_no = counter
      workSheet.addRow(order)
      counter++
    })

    workSheet.getRow(1).eachCell(function (cell) {
      cell.font = { bold: true };
    })

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader("Content-Disposition", `attachment;filename=order.xlsx`);

    return workBook.xlsx.write(res).then(function () {
      res.status(200);
    })
  } catch (error) {
    console.log(error.message);
  }
}

const salesReport = async (req, res) => {
  try {
    const orderData = await Order.aggregate([
      {
        $group: {
          _id: { $dayOfWeek: { date: "$createdAt" } },
          amount: { $sum: "$sellingPrice" },
        },
      },
    ])

    const a = orderData.map((x) => x._id)
    const amount = orderData.map((x) => x.amount)
    res.render('salesGraph', { amount })
  } catch (error) {
    console.log(error.messaage);
  }
}

// -----------------------------------------------Reports and charts End --------------------------------------------------------------//

// -------------------------------------------- Banner Start ------------------------------------------------------------------//

// banner loading
const bannerLoad = async (req, res) => {
  const productData = await Product.find({}).populate('category').populate('author')
  // console.log('product data ' + productData)
  const bannerData = await Banner.find({})
  console.log('Banner Dataaaaaa' + bannerData)
  try {
    res.render('banners', { bannerData })
  } catch (error) {
    console.log(error.mesage)
  }
}

// add new banner load
const addBannerLoad = async (req, res) => {
  try {
    const bannerData = await Banner.find({})
    res.render('addBanner', { bannerData })
  } catch (error) {
    console.log(error.message)
  }
}

// banner post
const addBannerPost = async (req, res) => {
  console.log('banner post')
  // res.redirect('/admin/banners')
  try {
    const banner = new Banner({
      name: req.body.name,
      link: req.body.link,
      image: req.file.filename
    })
    const bannerData = await banner.save()
    console.log('Banner dataaaaaaaaaa ' + bannerData)
    res.redirect('/admin/banners')
  } catch (error) {
    console.log(error.message)
  }
}

// update banner load
const updateBannerLoad = async (req, res) => {
  // console.log('update banner load')
  const bannerData = await Banner.findById({ _id: req.query.id })
  // console.log('baner dataaaaaaaaaaa ' + bannerData)
  res.render('updateBanner', { bannerData })
}

const updateBannerPost = async (req, res) => {
  const bannerData = await Banner.findById({ _id: req.query.id })
  console.log('baner dataaaaaaaaaaa ' + bannerData)
  res.redirect('/admin/banners')
}

// banner blocking and unblocking
const blockBanner = async (req, res) => {
  try {
    const bannerId = req.query.id
    const bannerData = await Banner.findById({ _id: bannerId })
    console.log('banner data for blocking : ' + bannerData)
    // console.log('blocked dddddddddddd   ' + bannerData.isBlocked)
    const value = bannerData.isBlocked
    console.log(value)
    if (value === true) {
      const bannerUpdate = await Banner.findByIdAndUpdate({ _id: bannerId }, { $set: { isBlocked: false } })
      res.redirect('/admin/banners')
    } else if (value === false) {
      const bannerUpdate = await Banner.findByIdAndUpdate({ _id: bannerId }, { $set: { isBlocked: true } })
      res.redirect('/admin/banners')
      console.log(bannerData)
    }
  } catch (error) {
    console.log(error.message)
  }
}

// banner delete
const deleteBanner = async (req, res) => {
  try {
    await Banner.findByIdAndDelete({ _id: req.query.id })
    res.redirect('/admin/banners')
  } catch (error) {
    console.log(error.message)
  }
}

// ---------------------------------------------------------------Banner End -----------------------------------------------------------//

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

// user blocking and unblocking
const blockUser = async (req, res) => {
  try {
    const userId = req.query.id
    // console.log(userId)
    const userData = await User.findOne({ _id: userId })
    const value = userData.isBlocked
    console.log(value)
    if (value === true) {
      await User.findByIdAndUpdate({ _id: userId }, { $set: { isBlocked: false } })
      res.redirect('/admin/user')
    } else if (value === false) {
      await User.findByIdAndUpdate({ _id: userId }, { $set: { isBlocked: true } })
      if (req.session.user_id === userId) {
        req.session.user_id = ''
      }
      res.redirect('user')
      // console.log(userData)
    }
  } catch (error) {
    console.log(error.message)
  }
}

// -------------------------------------------------Author Start --------------------------------------------------//

// author show
const authorLoad = async (req, res) => {
  try {
    const authorData = await Author.find({ })
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
    const authorName = req.body.name.trim().toLowerCase()
    const isExists = await Author.findOne({ name: authorName })
    if (isExists === null) {
      const author = new Author({
        name: req.body.name.trim(),
        description: req.body.description.trim()
      })
      await author.save()
      res.redirect('author')
    } else {
      res.render('addAuthor', { message: 'Author Name already exists' })
    }
  } catch (error) {
    console.log(error.message)
  }
}

// update author page
const updateAuthorLoad = async (req, res) => {
  try {
    const authorId = req.query.id
    const authorData = await Author.findOne({ _id: authorId })
    console.log(authorData)
    res.render('updateAuthor', { author: authorData })
  } catch (error) {
    console.log(error.mesage)
  }
}

// update author POST
const updateAuthor = async (req, res) => {
  try {
    const authorId = req.body.id
    const authorName = req.body.name.trim().toLowerCase()
    const authorData = await Author.findOne({ _id: authorId })
    const isExists = await Author.findOne({ name: authorName })
    if (isExists === null) {
      await Author.findByIdAndUpdate({ _id: authorId }, { $set: { name: req.body.name.trim(), description: req.body.description.trim() } })
      res.redirect('/admin/author')
    } else {
      res.render('updateAuthor', { author: authorData, message: 'Author Name already exists' })
    }
  } catch (error) {
    console.log(error.mesage)
  }
}

// author blocking and unblocking
const blockAuthor = async (req, res) => {
  try {
    const authorId = req.query.id
    console.log('author id for blocking : ' + authorId)
    const authorData = await Author.findOne({ _id: authorId })
    // await Product.updateMany({}, { $set: { isBlocked: false } })
    const value = authorData.isBlocked
    if (value === true) {
      await Author.findByIdAndUpdate({ _id: authorId }, { $set: { isBlocked: false } })
      const authorProducts = await Product.find({ author: authorId })
      console.log("author productsssssssssssssssss : " + authorProducts)
      for (const eachProduct of authorProducts) {
        eachProduct.isBlocked = false
        await eachProduct.save()
      }
      console.log("author update  : " + authorProducts)
      res.redirect('/admin/author')
    } else if (value === false) {
      await Author.findByIdAndUpdate({ _id: authorId }, { $set: { isBlocked: true } })
      const authorProducts = await Product.find({ author: authorId })
      console.log("author productsssssssssssssssss : " + authorProducts)
      for (const eachProduct of authorProducts) {
        eachProduct.isBlocked = true
        await eachProduct.save()
      }
      console.log("author update productsssssssssssssssss : " + authorProducts)
      res.redirect('/admin/author')
    }
  } catch (error) {
    console.log(error.message)
  }
}

// delete Author
const deleteAuthor = async (req, res) => {
  try {
    const authorId = req.query.id
    const authorData = await Author.findByIdAndUpdate({ _id: authorId }, { $set: { isDeleted: true } })
    await authorData.save()
    const authorProducts = await Product.find({ author: authorId })
    console.log("author products before deleting : " + authorProducts)
    for (const eachProduct of authorProducts) {
      eachProduct.isDeleted = true
      await eachProduct.save()
    }
    console.log('author delted data : ' + authorData)
    res.redirect('/admin/author')
  } catch (error) {
    console.log(error.message)
  }
}

// -------------------------------------------------Author End --------------------------------------------------//

// -------------------------------------------------Category Start ----------------------------------------------------//
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
    res.render('newCategory')
  } catch (error) {

  }
}

// add new category POST
const addCategory = async (req, res) => {
  try {
    const categoryName = req.body.name.trim().toLowerCase()
    const isExists = await Category.findOne({ name: categoryName })
    if (isExists === null) {
      const category = new Category({
        name: req.body.name.trim(),
        description: req.body.description.trim()
      })
      await category.save()
      res.redirect('category')
    } else {
      res.render('newCategory', { message: 'Category Name already exists' })
    }
  } catch (error) {
    console.log(error.message)
    res.render('newCategory', { message: error })
  }
}

// delete category
const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.query.id
    const categoryData = await Category.findByIdAndDelete({ _id: categoryId })
    const categoryProducts = await Product.find({ category: categoryId })
    console.log("category products before deleting : " + categoryProducts)
    for (const eachProduct of categoryProducts) {
      eachProduct.isDeleted = true
      await eachProduct.save()
    }
    res.redirect('/admin/category')
  } catch (error) {
    console.log(error.message)
  }
}

// update Category page load
const updateCategoryLoad = async (req, res) => {
  try {
    const categoryId = req.query.id
    const categoryData = await Category.findOne({ _id: categoryId })
    res.render('updateCategory', { category: categoryData })
  } catch (error) {
    console.log(error.mesage)
  }
}

// update category POST
const updateCategory = async (req, res) => {
  try {
    const categoryId = req.body.id
    const categoryData = await Category.findOne({ _id: categoryId })
    const categoryName = req.body.name.trim().toLowerCase()
    const isExists = await Category.findOne({ name: categoryName })
    console.log('is exists : ' + isExists)

    if (isExists === null) {
      await Category.findByIdAndUpdate({ _id: categoryId }, { $set: { name: req.body.name.trim(), description: req.body.description.trim() } })
      res.redirect('/admin/category')
    } else {
      res.render('updateCategory', { category: categoryData, message: 'Category Name already exists' })
    }
  } catch (error) {
    console.log(error.mesage)
  }
}

// category blocking and unblocking
const blockCategory = async (req, res) => {
  try {
    const categoryId = req.query.id
    console.log('category id for blocking : ' + categoryId)
    const categoryData = await Category.findOne({ _id: categoryId })
    // await Product.updateMany({}, { $set: { isBlocked: false } })
    const value = categoryData.isBlocked
    if (value === true) {
      await Category.findByIdAndUpdate({ _id: categoryId }, { $set: { isBlocked: false } })
      const categoryProducts = await Product.find({ category: categoryId })
      console.log("category before true : " + categoryProducts)
      for (const eachProduct of categoryProducts) {
        eachProduct.isBlocked = false
        await eachProduct.save()
      }
      console.log("category after false : " + categoryProducts)
      res.redirect('/admin/category')
    } else if (value === false) {
      await Category.findByIdAndUpdate({ _id: categoryId }, { $set: { isBlocked: true } })
      const categoryProducts = await Product.find({ category: categoryId })
      console.log("category before false : " + categoryProducts)
      for (const eachProduct of categoryProducts) {
        eachProduct.isBlocked = true
        await eachProduct.save()
      }
      console.log("category after true : " + categoryProducts)
      res.redirect('/admin/category')
    }
  } catch (error) {
    console.log(error.message)
  }
}

// -------------------------------------------------------------Category End ---------------------------------------------------//

// logout
const logout = async (req, res) => {
  try {
    req.session.admin_id = ''
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

// ------------------------------------------------- orders management --------------------------------------------------//

const orderLoad = async (req, res) => {
  try {
    const orderData = await Order.find({}).sort({ createdAt: -1 })
    res.render('orders', { orderData })
  } catch (error) {

  }
}

const cancelOrder = async (req, res) => {
  try {
    const singleOrder = await Order.findByIdAndUpdate({ _id: req.query.id }, { $set: { status: 'Cancelled' } })
    console.log('cancelled order detailsssssssssss' + singleOrder)
    // const orderData = await Order.find({})
    res.redirect('/admin/orders')
  } catch (error) {

  }
}

const editOrderLoad = async (req, res) => {
  try {
    const orderData = await Order.findById({ _id: req.query.id })
    res.render('updateOrder', { orderData })
  } catch (error) {
  }
}

const postOrderLoad = async (req, res) => {
  try {
    console.log('order edit post')
    const orderData = await Order.findByIdAndUpdate({ _id: req.body.id }, { $set: { status: req.body.status } })
    console.log('order data psot ' + orderData)
    res.redirect('/admin/orders')
  } catch (error) {
  }
}

// --------------------------------------------------orders end --------------------------------------------------------//

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
  blockCategory,
  logout,
  updateProductLoad,
  updateProduct,
  authorLoad,
  addAuthor,
  addAuthorPost,
  updateAuthorLoad,
  updateAuthor,
  blockAuthor,
  deleteAuthor,
  bannerLoad,
  addBannerLoad,
  addBannerPost,
  updateBannerLoad,
  updateBannerPost,
  blockBanner,
  deleteBanner,
  orderLoad,
  editOrderLoad,
  cancelOrder,
  postOrderLoad,
  downloadSalesReport,
  salesReport
}
