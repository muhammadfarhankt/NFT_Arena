const isLogin = async (req, res, next) => {
  try {
    if (req.session.author_id) {} else {
      res.redirect('/author')
    }
    next()
  } catch (error) {
    console.log(error.message)
  }
}
const isLogout = async (req, res, next) => {
  try {
    if (req.session.author_id) {
      res.redirect('/author/home')
    }
    next()
  } catch (error) {
    console.log(error.message)
  }
}
module.exports = {
  isLogin,
  isLogout
}
