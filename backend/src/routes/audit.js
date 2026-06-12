const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, adminOnly } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authenticate, adminOnly, async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        user: { select: { name: true, email: true } },
        asset: { select: { name: true } },
      },
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
