import 'dotenv/config';
import { Sequelize } from 'sequelize';
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
export const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: process.env.DB_SSL === 'true' ? { ssl: { require: true, rejectUnauthorized: true } } : {},
});
