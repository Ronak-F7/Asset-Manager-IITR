const express = require('express');
const QRCode = require('qrcode');
const { PrismaClient } = require('@prisma/client');
const { authenticate, adminOnly } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all assets (with search/filter)
router.get('/', authenticate, async (req, res) => {
  try {
    const { search, category, status } = req.query;
    const where = {};
    if (search) where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { description: { contains: search, mode: 'insensitive' } }];
    if (category) where.category = category;
    if (status) where.status = status;

    const assets = await prisma.asset.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json(assets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get asset categories
router.get('/categories', authenticate, async (req, res) => {
  const categories = await prisma.asset.findMany({ select: { category: true }, distinct: ['category'] });
  res.json(categories.map(c => c.category));
});

// Get single asset
router.get('/:id', authenticate, async (req, res) => {
  try {
    const asset = await prisma.asset.findUnique({
      where: { id: req.params.id },
      include: { bookings: { include: { user: { select: { name: true, email: true } } }, orderBy: { createdAt: 'desc' }, take: 10 } },
    });
    if (!asset) return res.status(404).json({ error: 'Asset not found' });
    res.json(asset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create asset (admin)
router.post('/', authenticate, adminOnly, async (req, res) => {
  try {
    const { name, category, description, totalQuantity, condition } = req.body;
    const asset = await prisma.asset.create({
      data: { name, category, description, totalQuantity: +totalQuantity, availableQuantity: +totalQuantity, condition },
    });

    // Generate QR code
    const qrData = JSON.stringify({ id: asset.id, name: asset.name });
    const qrCode = await QRCode.toDataURL(qrData);
    const updated = await prisma.asset.update({ where: { id: asset.id }, data: { qrCode } });

    await prisma.auditLog.create({ data: { userId: req.user.id, assetId: asset.id, action: 'ASSET_CREATED', details: `Created asset: ${name}` } });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update asset (admin)
router.put('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const { name, category, description, totalQuantity, status, condition } = req.body;
    const existing = await prisma.asset.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Asset not found' });

    const diff = totalQuantity ? +totalQuantity - existing.totalQuantity : 0;
    const asset = await prisma.asset.update({
      where: { id: req.params.id },
      data: {
        name, category, description, condition, status,
        ...(totalQuantity && { totalQuantity: +totalQuantity, availableQuantity: Math.max(0, existing.availableQuantity + diff) }),
      },
    });

    await prisma.auditLog.create({ data: { userId: req.user.id, assetId: asset.id, action: 'ASSET_UPDATED', details: `Updated asset: ${asset.name}` } });
    res.json(asset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete asset (admin)
router.delete('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    await prisma.asset.delete({ where: { id: req.params.id } });
    await prisma.auditLog.create({ data: { userId: req.user.id, action: 'ASSET_DELETED', details: `Deleted asset ID: ${req.params.id}` } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
