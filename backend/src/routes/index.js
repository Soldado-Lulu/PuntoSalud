import { Router } from 'express';
import { z } from 'zod';
import { sequelize } from '../config/db.js';
import { Medication, Product, Symptom } from '../models/index.js';
import { adminOnly } from '../middleware/admin.js';
import { bumpRevision, getCatalog } from '../services/catalog.js';
const router = Router();
const uuid = z.string().uuid();
const optionalText = z.string().trim().max(10000).nullable().optional();
const medicationSchema = z.object({
  genericName: z.string().trim().min(2).max(180),
  therapeuticClass: optionalText,
  description: optionalText,
  functionDescription: optionalText,
  precautions: optionalText,
  contraindications: optionalText,
  sideEffects: optionalText,
  verified: z.boolean().default(false),
  sourceUrl: z.string().url().nullable().optional(),
}).strict();
const productSchema = z.object({
  medicationId: uuid, brandName: z.string().trim().min(2).max(180),
  composition: optionalText, presentation: optionalText, strength: optionalText,
  manufacturer: optionalText, verified: z.boolean().default(false),
  sourceUrl: z.string().url().nullable().optional(),
}).strict();
const symptomSchema = z.object({ name: z.string().trim().min(2).max(150) }).strict();
const relationSchema = z.object({ medicationId: uuid, symptomId: uuid, note: optionalText }).strict();
router.get('/health', (_req, res) => res.json({ ok: true }));
router.get('/medications', async (_req, res, next) => {
  try { res.json(await Medication.findAll({ include: [{ model: Product, as: 'products' }, { model: Symptom, as: 'symptoms', through: { attributes: ['note'] } }], order: [['genericName', 'ASC']] })); }
  catch (e) { next(e); }
});
router.get('/symptoms', async (_req, res, next) => {
  try { res.json(await Symptom.findAll({ order: [['name', 'ASC']] })); }
  catch (e) { next(e); }
});
router.get('/sync/catalog', async (req, res, next) => {
  try {
    const catalog = await getCatalog();
    const etag = `"catalog-${catalog.revision}"`;
    res.set('ETag', etag).set('Cache-Control', 'no-cache');
    if (req.headers['if-none-match'] === etag) return res.status(304).end();
    res.json(catalog);
  } catch (e) { next(e); }
});
router.post('/admin/medications', adminOnly, async (req, res, next) => {
  try {
    const body = medicationSchema.parse(req.body);
    const record = await sequelize.transaction(async transaction => {
      const created = await Medication.create(body, { transaction });
      await bumpRevision(transaction);
      return created;
    });
    res.status(201).json(record);
  } catch (e) { next(e); }
});
router.patch('/admin/medications/:id', adminOnly, async (req, res, next) => {
  try {
    const id = uuid.parse(req.params.id);
    const fields = medicationSchema.partial().parse(req.body);
    if (!Object.keys(fields).length) return res.status(400).json({ error: 'No fields provided' });
    const updated = await sequelize.transaction(async transaction => {
      const item = await Medication.findByPk(id, { transaction });
      if (!item) return null;
      await item.update(fields, { transaction });
      await bumpRevision(transaction);
      return item;
    });
    if (!updated) return res.status(404).json({ error: 'Medication not found' });
    res.json(updated);
  } catch (e) { next(e); }
});
router.post('/admin/products', adminOnly, async (req, res, next) => {
  try {
    const body = productSchema.parse(req.body);
    const item = await sequelize.transaction(async transaction => {
      const product = await Product.create(body, { transaction });
      await bumpRevision(transaction);
      return product;
    });
    res.status(201).json(item);
  } catch (e) { next(e); }
});
router.post('/admin/symptoms', adminOnly, async (req, res, next) => {
  try {
    const body = symptomSchema.parse(req.body);
    const item = await sequelize.transaction(async transaction => {
      const symptom = await Symptom.create(body, { transaction });
      await bumpRevision(transaction);
      return symptom;
    });
    res.status(201).json(item);
  } catch (e) { next(e); }
});
router.post('/admin/medication-symptoms', adminOnly, async (req, res, next) => {
  try {
    const body = relationSchema.parse(req.body);
    const item = await sequelize.transaction(async transaction => {
      const med = await Medication.findByPk(body.medicationId, { transaction });
      const symptom = await Symptom.findByPk(body.symptomId, { transaction });
      if (!med || !symptom) return null;
      await med.addSymptom(symptom, { through: { note: body.note ?? null }, transaction });
      await bumpRevision(transaction);
      return { ok: true };
    });
    if (!item) return res.status(404).json({ error: 'Medication or symptom not found' });
    res.status(201).json(item);
  } catch (e) { next(e); }
});
export default router;
