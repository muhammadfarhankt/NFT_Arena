const mongoose = require('mongoose')
// eslint-disable-next-line no-unused-vars
const Product = require('../models/productModel')
// eslint-disable-next-line no-unused-vars
const User = require('../models/userModel')

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true
  },
  payment: {
    type: String,
    required: true
  },
  products: {
    item: [{
      productId: {
        type: mongoose.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: {
        type: Number,
        required: true
      },
      price: {
        type: Number,
        required: true
      }
    }],
    totalPrice: {
      type: Number,
      default: 0
    }
  },
  sellingPrice: {
    type: Number
  },
  status: {
    type: String,
    default: 'Attempted'
  },
  isOrder: {
    type: Boolean,
    default: true
  },
  name: {
    type: String,
    required: true
  },
  phone: {
    type: Number
  },
  email: {
    type: String
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String
  },
  zip: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Orders', orderSchema)
