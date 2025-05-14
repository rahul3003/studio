const { verifyToken } = require('./jwt');
const prisma = require('../prisma/client');

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token' });
  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyToken(token);
    const user = await prisma.employee.findUnique({ where: { id: payload.id } });
    if (!user || user.jwtToken !== token) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function requireAdminOrSuperadmin(req, res, next) {
  if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN')) {
    return res.status(403).json({ error: 'Forbidden: Admin or Superadmin only' });
  }
  next();
}

module.exports = authMiddleware;
module.exports.requireAdminOrSuperadmin = requireAdminOrSuperadmin; 