module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB_URL:
    process.env.DATABASE_URL || 'postgresql://friendly-financial@localhost/friendly-financial',
  JWT_SECRET: process.env.JWT_SECRET || 'change-this-secret',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '24h',
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api'
};
