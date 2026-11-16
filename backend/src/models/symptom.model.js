import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
export const Symptom = sequelize.define('Symptom', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(150), allowNull: false, unique: true },
}, { tableName: 'symptoms', underscored: true, timestamps: true });
