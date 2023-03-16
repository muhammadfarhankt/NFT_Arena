const express = require('express')
const adminRoute = express()
const session = require('express-session')
const config = require('../config/config')
adminRoute.use(session({ secret: config.sessionSecret, saveUninitialized: true, resave: false }))
const adminAuth = require('../middlewares/adminAuth')
const bodyParser = require('body-parser')
adminRoute.use(bodyParser.json())
adminRoute.use(bodyParser.urlencoded({ extended: true }))
adminRoute.set('view engine', 'ejs')
adminRoute.set('views', './views/admin')

const multer = require('multer')

const mime = require('mime')

const path = require('path')
const adminController = require('../controllers/adminController')

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

adminRoute.get('/', adminAuth.isLogout, adminController.loadLogin)
adminRoute.post('/', adminController.verifyLogin)
adminRoute.get('/home', adminAuth.isLogin, adminController.loadDashboard)

adminRoute.get('/salesReport', adminAuth.isLogin, adminController.downloadSalesReport)
adminRoute.get('/sales', adminAuth.isLogin, adminController.salesReport)

adminRoute.get('/category', adminAuth.isLogin, adminController.categoryLoad)
adminRoute.get('/addcategory', adminAuth.isLogin, adminController.addCategoryLoad)
adminRoute.post('/addcategory', adminController.addCategory)
adminRoute.get('/updateCategory', adminAuth.isLogin, adminController.updateCategoryLoad)
adminRoute.post('/updateCategory', adminController.updateCategory)
adminRoute.get('/deleteCategory', adminAuth.isLogin, adminController.deleteCategory)

adminRoute.get('/blockCategory', adminAuth.isLogin, adminController.blockCategory)

adminRoute.get('/author', adminAuth.isLogin, adminController.authorLoad)
adminRoute.get('/addAuthor', adminAuth.isLogin, adminController.addAuthor)
adminRoute.post('/addAuthor', adminAuth.isLogin, adminController.addAuthorPost)
adminRoute.get('/updateAuthor', adminAuth.isLogin, adminController.updateAuthorLoad)
adminRoute.post('/updateAuthor', adminAuth.isLogin, adminController.updateAuthor)
adminRoute.get('/blockAuthor', adminAuth.isLogin, adminController.blockAuthor)
adminRoute.get('/deleteAuthor', adminAuth.isLogin, adminController.deleteAuthor)

adminRoute.get('/products', adminAuth.isLogin, adminController.productLoad)
adminRoute.get('/addproduct', adminAuth.isLogin, adminController.addProductLoad)
adminRoute.post('/addproduct', upload.single('image'), adminController.addProduct)
adminRoute.get('/updateProduct', adminAuth.isLogin, adminController.updateProductLoad)
adminRoute.post('/updateProduct', adminController.updateProduct)
adminRoute.get('/deleteProduct', adminAuth.isLogin, adminController.deleteProduct)

adminRoute.get('/banners', adminAuth.isLogin, adminController.bannerLoad)
adminRoute.get('/addBanner', adminAuth.isLogin, adminController.addBannerLoad)
adminRoute.post('/addBanner', upload.single('image'), adminController.addBannerPost)
adminRoute.get('/updateBanner', adminAuth.isLogin, adminController.updateBannerLoad)
adminRoute.post('/updateBanner', upload.single('image'), adminController.updateBannerPost)
adminRoute.get('/blockBanner', adminAuth.isLogin, adminController.blockBanner)
adminRoute.get('/deleteBanner', adminAuth.isLogin, adminController.deleteBanner)

adminRoute.get('/user', adminAuth.isLogin, adminController.userLoad)
adminRoute.get('/blockUser', adminAuth.isLogin, adminController.blockUser)

adminRoute.get('/orders', adminAuth.isLogin, adminController.orderLoad)
adminRoute.get('/editOrder', adminAuth.isLogin, adminController.editOrderLoad)
adminRoute.post('/editOrder', adminAuth.isLogin, adminController.postOrderLoad)
adminRoute.get('/cancelOrder', adminAuth.isLogin, adminController.cancelOrder)

adminRoute.get('/adminlogout', adminController.logout)

adminRoute.get('*', function (req, res) {
  res.redirect('/admin')
})

module.exports = adminRoute
