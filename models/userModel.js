const mongoose = require('mongoose')
// eslint-disable-next-line no-unused-vars
const Product = require('../models/productModel')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  mobile: {
    type: Number,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  token: {
    type: String,
    default: ''
  },
  address: {
    type: String
  },
  city: {
    type: String
  },
  state: {
    type: String
  },
  zip: {
    type: String
  },
  cart: {
    item: [
      {
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
          type: Number
        },
        name: {
          type: String,
          required: true
        },
        image: {
          type: String,
          required: true
        }
      }
    ],
    totalPrice: {
      type: Number,
      default: 0
    }
  },
  wishlist: {
    item: [
      {
        productId: {
          type: mongoose.Types.ObjectId,
          ref: 'Product',
          required: true
        }
      }
    ]
  }

}, {
  timestamps: true
})

// add to cart
userSchema.methods.addToCart = function (product) {
  const cart = this.cart
  const indexNumber = cart.item.findIndex(objInItems => {
    // eslint-disable-next-line no-new-wrappers
    return new String(objInItems.productId).trim() === new String(product._id).trim()
  })
  console.log('indexNumber :  ' + indexNumber)
  if (indexNumber >= 0) {
    cart.item[indexNumber].quantity += 1
  } else {
    cart.item.push({
      productId: product._id,
      quantity: 1,
      price: product.price,
      name: product.name,
      image: product.image
    })
  }
  cart.totalPrice += product.price
  return this.save()
}

// add wishlist
userSchema.methods.addWishlist = function (productId) {
  const wishlist = this.wishlist
  // eslint-disable-next-line no-new-wrappers
  const indexNumber = wishlist.item.findIndex(objInItems => new String(objInItems.productId).trim() === new String(productId).trim())
  console.log('wish indexNumber :   ' + indexNumber)
  if (indexNumber < 0) {
    wishlist.item.push({ productId })
  }
  return this.save()
}

module.exports = mongoose.model('User', userSchema)
