const db = require('../database/dbConfig')

module.exports = {
register
}
function register(user){
  return db('users').insert(user).then(id => id)
}