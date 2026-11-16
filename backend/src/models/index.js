import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
const options = { underscored: true, timestamps: true };
export const Medication = sequelize.define('Medication', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  genericName: { type: DataTypes.STRING(180), allowNull: false, unique: true },
  therapeuticClass: DataTypes.STRING(200),
  description: DataTypes.TEXT,
  functionDescription: DataTypes.TEXT,
  precautions: DataTypes.TEXT,
  contraindications: DataTypes.TEXT,
  sideEffects: DataTypes.TEXT,
  verified: { type: DataTypes.BOOLEAN, defaultValue: false, allowNull: false },
  sourceUrl: DataTypes.TEXT,
}, { ...options, tableName: 'medications' });
export const Product = sequelize.define('Product', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  medicationId: { type: DataTypes.UUID, allowNull: false },
  brandName: { type: DataTypes.STRING(180), allowNull: false },
  composition: DataTypes.TEXT,
  presentation: DataTypes.STRING(180),
  strength: DataTypes.STRING(120),
  manufacturer: DataTypes.STRING(180),
  verified: { type: DataTypes.BOOLEAN, defaultValue: false, allowNull: false },
  sourceUrl: DataTypes.TEXT,
}, { ...options, tableName: 'products' });
export const Symptom = sequelize.define('Symptom', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(150), allowNull: false, unique: true },
}, { ...options, tableName: 'symptoms' });
export const MedicationSymptom = sequelize.define('MedicationSymptom', {
  medicationId: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
  symptomId: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
  note: DataTypes.TEXT,
}, { ...options, tableName: 'medication_symptoms' });
export const CatalogVersion = sequelize.define('CatalogVersion', {
  id: { type: DataTypes.INTEGER, primaryKey: true },
  revision: { type: DataTypes.INTEGER, allowNull: false },
  updatedAt: { type: DataTypes.DATE, allowNull: false },
}, { tableName: 'catalog_versions', timestamps: false, underscored: true });
Medication.hasMany(Product, { as: 'products', foreignKey: 'medicationId' });
Product.belongsTo(Medication, { as: 'medication', foreignKey: 'medicationId' });
Medication.belongsToMany(Symptom, { through: MedicationSymptom, as: 'symptoms', foreignKey: 'medicationId', otherKey: 'symptomId' });
Symptom.belongsToMany(Medication, { through: MedicationSymptom, as: 'medications', foreignKey: 'symptomId', otherKey: 'medicationId' });
