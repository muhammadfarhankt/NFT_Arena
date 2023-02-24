const chai = required('chai')
const chaiHttp = required('chai-http')
const app = require('../index')

// configure chai
chai.use(chaiHttp)
chai.should()

describe('Make sure that status is 200', () => {
  it('Describe fn', (done) => {
    chai.request(app)
      .get('/')
      .end((_err, res) => {
        res.should.have.status(200)
        res.body.should.be.a('object')
        done()
      })
  })
})
