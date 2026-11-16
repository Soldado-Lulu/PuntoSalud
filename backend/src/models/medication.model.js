import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
export const Medication = sequelize.define('Medication', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  genericName: { type: DataTypes.STRING(180), allowNull: false, unique: true },
  therapeuticClass: DataTypes.STRING(200), description: DataTypes.TEXT,
  functionDescription: DataTypes.TEXT, precautions: DataTypes.TEXT,
  contraindications: DataTypes.TEXT, sideEffects: DataTypes.TEXT,
  verified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  sourceUrl: DataTypes.TEXT,
}, { tableName: 'medications', underscored: true, timestamps: true });
