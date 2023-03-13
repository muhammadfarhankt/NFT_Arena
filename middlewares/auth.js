// eslint-disable-next-line no-unused-vars
const session = require('express-session')

const isLogin = async (req, res, next) => {
  try {
    // eslint-disable-next-line no-empty
    if (req.session.user_id) { } else {
      res.redirect('/login')
    }
    next()
  } catch (error) {
    console.log(error.message)
  }
}

const isLogout = async (req, res, next) => {
  try {
    if (req.session.user_id) {
      res.redirect('/home')
    } else {
      next()
    }
  } catch (error) {
    console.log(error.message)
  }
}
module.exports = {
  isLogin,
  isLogout
}
