import 'dotenv/config';
import { sequelize } from '../config/db.js';
import { CatalogVersion, Medication, Product, Symptom } from '../models/index.js';
const symptoms = ['Dolor de cabeza', 'Dolor muscular', 'Fiebre', 'Dolor dental'];
const entries = [
  {
    genericName: 'Ibuprofeno', therapeuticClass: 'Antiinflamatorio no esteroideo',
    description: 'AINE para aliviar dolor, inflamación y fiebre.',
    functionDescription: 'Analgésico, antipirético y antiinflamatorio.',
    precautions: 'Riesgos gastrointestinales, renales y cardiovasculares; consultar en embarazo.',
    contraindications: 'Alergia a AINE, sangrado digestivo activo, entre otras.',
    sideEffects: 'Náuseas, acidez, molestias abdominales; posibles efectos graves.',
    verified: false, sourceUrl: null,
  },
  {
    genericName: 'Azitromicina', therapeuticClass: 'Antibiótico macrólido',
    description: 'Antibiótico para determinadas infecciones bacterianas, bajo prescripción.',
    functionDescription: 'Inhibe la síntesis de proteínas bacterianas.',
    precautions: 'No automedicarse; riesgo de interacciones y alteraciones del ritmo cardíaco.',
    contraindications: 'Hipersensibilidad a macrólidos, entre otras.',
    sideEffects: 'Náuseas, diarrea, dolor abdominal; posibles efectos graves.',
    verified: false, sourceUrl: null,
  }
];
let changed = false;
await sequelize.transaction(async transaction => {
  for (const data of entries) {
    const [, created] = await Medication.findOrCreate({ where: { genericName: data.genericName }, defaults: data, transaction });
    changed ||= created;
  }
  for (const name of symptoms) {
    const [, created] = await Symptom.findOrCreate({ where: { name }, defaults: { name }, transaction });
    changed ||= created;
  }
  const ibuprofen = await Medication.findOne({ where: { genericName: 'Ibuprofeno' }, transaction });
  const existing = await Product.findOne({ where: { medicationId: ibuprofen.id, brandName: 'Ejemplo genérico', strength: '400 mg' }, transaction });
  if (!existing) {
    await Product.create({ medicationId: ibuprofen.id, brandName: 'Ejemplo genérico', composition: 'Ibuprofeno 400 mg por tableta; excipientes varían por fabricante', presentation: 'Tableta', strength: '400 mg', verified: false }, { transaction });
    changed = true;
  }
  // No associations between antibiotics and symptoms: symptoms alone do not justify an antibiotic.
  const version = await CatalogVersion.findByPk(1, { transaction });
  if (changed) await version.update({ revision: version.revision + 1, updatedAt: new Date() }, { transaction });
});
console.log(changed ? 'Seed initial records created.' : 'Seed already applied; no changes.');
await sequelize.close();
