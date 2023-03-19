const mongoose = require('mongoose')

const bannerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  image: {
    type: String
  },
  link: {
    type: String
  },
  textPosition: {
    type: String,
    default: 'right',
    enum: ['left', 'right']
  },
  textHeader: {
    type: String,
    default: 'Banner Heading '
  },
  textContent: {
    type: String,
    default: 'NFT Arena combines dynamic NFTs and Hyperlane to allow users to create an NFT hero and train it via different training courses in different chains,..'
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

module.exports = mongoose.model('Banner', bannerSchema)
