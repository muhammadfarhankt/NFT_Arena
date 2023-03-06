const { ObjectId } = require('mongodb')
const mongoose = require('mongoose')
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  stock: {
    type: Number
  },
  image: {
    type: String
  },
  category: {
    type: ObjectId,
    ref: 'Category'
  },
  author: {
    type: ObjectId,
    ref: 'Author'
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})
module.exports = mongoose.model('Product', productSchema)
