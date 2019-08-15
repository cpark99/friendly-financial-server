const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../config')

const AuthService = {
  getUserWithEmail(db, email) {
    return db('ff_users')
      .where({ email })
      .first();
  }, 
  parseBasicToken(token) {
    return Buffer
      .from(token, 'base64')
      .toString()
      .split(':');
  },
  createJwt(subject,payload){
    return jwt.sign(payload, config.JWT_SECRET,{
      subject,
      expiresIn: config.JWT_EXPIRY,
      algorithm:'HS256',
    })
  },
  verifyJwt(payload){
    return jwt.verify(payload,config.JWT_SECRET,{      
      algorithms:['HS256'],
    })
  },
  comparePasswords(password,hash){
    return bcrypt.compare(password,hash)
  }
};

module.exports = AuthService;