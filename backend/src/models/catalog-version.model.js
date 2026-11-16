import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
export const CatalogVersion = sequelize.define('CatalogVersion', {
  id: { type: DataTypes.INTEGER, primaryKey: true },
  revision: { type: DataTypes.INTEGER, allowNull: false },
  updatedAt: { type: DataTypes.DATE, allowNull: false },
}, { tableName: 'catalog_versions', timestamps: false, underscored: true });
