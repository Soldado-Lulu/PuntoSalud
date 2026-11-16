import { timingSafeEqual } from 'node:crypto';
export function adminOnly(req, res, next) {
  const expected = process.env.ADMIN_API_KEY || '';
  const received = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (expected.length < 32 || !received) return res.status(401).json({ error: 'Unauthorized' });
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return res.status(401).json({ error: 'Unauthorized' });
  next();
}
