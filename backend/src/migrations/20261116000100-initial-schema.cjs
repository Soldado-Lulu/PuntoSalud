'use strict';
module.exports = {
  async up(q, S) {
    await q.createTable('medications', {
      id: { type: S.UUID, primaryKey: true, allowNull: false, defaultValue: S.UUIDV4 },
      generic_name: { type: S.STRING(180), allowNull: false, unique: true },
      therapeutic_class: { type: S.STRING(200) },
      description: { type: S.TEXT },
      function_description: { type: S.TEXT },
      precautions: { type: S.TEXT },
      contraindications: { type: S.TEXT },
      side_effects: { type: S.TEXT },
      verified: { type: S.BOOLEAN, allowNull: false, defaultValue: false },
      source_url: { type: S.TEXT },
      created_at: { type: S.DATE, allowNull: false, defaultValue: S.NOW },
      updated_at: { type: S.DATE, allowNull: false, defaultValue: S.NOW }
    });
    await q.createTable('products', {
      id: { type: S.UUID, primaryKey: true, allowNull: false },
      medication_id: { type: S.UUID, allowNull: false, references: { model: 'medications', key: 'id' }, onDelete: 'CASCADE' },
      brand_name: { type: S.STRING(180), allowNull: false },
      composition: { type: S.TEXT },
      presentation: { type: S.STRING(180) },
      strength: { type: S.STRING(120) },
      manufacturer: { type: S.STRING(180) },
      verified: { type: S.BOOLEAN, allowNull: false, defaultValue: false },
      source_url: { type: S.TEXT },
      created_at: { type: S.DATE, allowNull: false, defaultValue: S.NOW },
      updated_at: { type: S.DATE, allowNull: false, defaultValue: S.NOW }
    });
    await q.createIndex('products', ['medication_id']);
    await q.createTable('symptoms', {
      id: { type: S.UUID, primaryKey: true, allowNull: false },
      name: { type: S.STRING(150), allowNull: false, unique: true },
      created_at: { type: S.DATE, allowNull: false, defaultValue: S.NOW },
      updated_at: { type: S.DATE, allowNull: false, defaultValue: S.NOW }
    });
    await q.createTable('medication_symptoms', {
      medication_id: { type: S.UUID, primaryKey: true, allowNull: false, references: { model: 'medications', key: 'id' }, onDelete: 'CASCADE' },
      symptom_id: { type: S.UUID, primaryKey: true, allowNull: false, references: { model: 'symptoms', key: 'id' }, onDelete: 'CASCADE' },
      note: { type: S.TEXT },
      created_at: { type: S.DATE, allowNull: false, defaultValue: S.NOW },
      updated_at: { type: S.DATE, allowNull: false, defaultValue: S.NOW }
    });
    await q.createTable('catalog_versions', {
      id: { type: S.INTEGER, primaryKey: true, allowNull: false },
      revision: { type: S.INTEGER, allowNull: false, defaultValue: 1 },
      updated_at: { type: S.DATE, allowNull: false, defaultValue: S.NOW }
    });
    await q.bulkInsert('catalog_versions', [{ id: 1, revision: 1, updated_at: new Date() }]);
  },
  async down(q) {
    await q.dropTable('medication_symptoms');
    await q.dropTable('catalog_versions');
    await q.dropTable('symptoms');
    await q.dropTable('products');
    await q.dropTable('medications');
  },
};
