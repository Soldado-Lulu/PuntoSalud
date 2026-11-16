import { sequelize } from '../config/db.js';
import { CatalogVersion, Medication, Product, Symptom } from '../models/index.js';
export async function bumpRevision(transaction) {
  await CatalogVersion.increment('revision', { by: 1, where: { id: 1 }, transaction });
  await CatalogVersion.update({ updatedAt: new Date() }, { where: { id: 1 }, transaction });
}
export async function getCatalog() {
  return sequelize.transaction({ isolationLevel: 'REPEATABLE READ', readOnly: true }, async transaction => {
    const version = await CatalogVersion.findByPk(1, { transaction });
    const medications = await Medication.findAll({
      include: [
        { model: Product, as: 'products', required: false },
        { model: Symptom, as: 'symptoms', through: { attributes: ['note'] }, required: false },
      ],
      order: [['genericName', 'ASC']], transaction,
    });
    const symptoms = await Symptom.findAll({ order: [['name', 'ASC']], transaction });
    return { revision: version.revision, updatedAt: version.updatedAt, medications, symptoms };
  });
}
