import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
export const Product = sequelize.define('Product', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  medicationId: { type: DataTypes.UUID, allowNull: false },
  brandName: { type: DataTypes.STRING(180), allowNull: false },
  composition: DataTypes.TEXT, presentation: DataTypes.STRING(180),
  strength: DataTypes.STRING(120), manufacturer: DataTypes.STRING(180),
  verified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  sourceUrl: DataTypes.TEXT,
}, { tableName: 'products', underscored: true, timestamps: true });
