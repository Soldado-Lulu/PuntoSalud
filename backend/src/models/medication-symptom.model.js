import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
export const MedicationSymptom = sequelize.define('MedicationSymptom', {
  medicationId: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
  symptomId: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
  note: DataTypes.TEXT,
}, { tableName: 'medication_symptoms', underscored: true, timestamps: true });
