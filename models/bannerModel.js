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
