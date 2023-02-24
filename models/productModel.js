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
    default: 0
  },
  image: {
    type: String
  },
  category: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  isDeleted: {
    Boolean,
    default: false
  }
}, {
  timestamps: true
})
module.exports = mongoose.model('Product', productSchema)
