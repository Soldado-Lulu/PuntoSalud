require('dotenv').config();
const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is required');
module.exports = {
  url,
  dialect: 'postgres',
  logging: false,
  dialectOptions: process.env.DB_SSL === 'true' ? { ssl: { require: true, rejectUnauthorized: true } } : {},
};
