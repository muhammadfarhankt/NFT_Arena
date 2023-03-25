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
    type: Number,
    default: 1
  },
  quantity: {
    type: Number,
    default: 1
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
  },
  wishlistCount: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  isSold: {
    type: Boolean,
    default: false
  },
  isAuthorBlocked: {
    type: Boolean,
    default: false
  },
  isCategoryBlocked: {
    type: Boolean,
    default: false
  },
  tags: {
    type: [String],
    default: ['nft']
  }
}, {
  timestamps: true
})
module.exports = mongoose.model('Product', productSchema)
