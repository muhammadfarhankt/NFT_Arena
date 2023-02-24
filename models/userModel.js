const mongoose = require('mongoose')
const Product = require('../models/productModel')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  mobile: {
    type: Number,
    required: true
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
    return new String(objInItems.productId).trim() == new String(product._id).trim()
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

// add cart
userSchema.methods.addWishlist = function (productId) {
  const wishlist = this.wishlist
  const indexNumber = wishlist.item.findIndex(objInItems => new String(objInItems.productId).trim() === new String(productId).trim())
  console.log('wish indexNumber :   ' + indexNumber)
  if (indexNumber < 0) {
    wishlist.item.push({ productId: productId })
  }
  return this.save()
}

module.exports = mongoose.model('User', userSchema)
