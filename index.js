const mongoose = require('mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/nftArena')
const express = require('express')
const app = express()
const userRoute = require('./routes/userRoute')
const adminRoute = require('./routes/adminRoute')
const authorRoute = require('./routes/authorRoute')

const path = require('path')

app.use('/', userRoute)
app.use('/admin', adminRoute)
app.use('/author', authorRoute)
app.use(express.static(path.join(__dirname, 'public')))
app.listen(3000, function () {
  console.log('Server started @ Port : 3000')
})
