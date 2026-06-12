const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, adminOnly } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get bookings (admin sees all, user sees own)
router.get('/', authenticate, async (req, res) => {
  try {
    const { status } = req.query;
    const where = req.user.role === 'USER' ? { userId: req.user.id } : {};
    if (status) where.status = status;

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        asset: { select: { id: true, name: true, category: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create booking request
router.post('/', authenticate, async (req, res) => {
  try {
    const { assetId, quantity, startDate, endDate, purpose } = req.body;
    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) return res.status(404).json({ error: 'Asset not found' });
    if (asset.availableQuantity < +quantity) return res.status(400).json({ error: `Only ${asset.availableQuantity} units available` });

    const booking = await prisma.booking.create({
      data: { userId: req.user.id, assetId, quantity: +quantity, startDate: new Date(startDate), endDate: new Date(endDate), purpose },
      include: { asset: { select: { name: true } } },
    });

    await prisma.auditLog.create({ data: { userId: req.user.id, assetId, action: 'BOOKING_REQUESTED', details: `Requested ${quantity}x ${asset.name}` } });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Approve booking (admin)
router.patch('/:id/approve', authenticate, adminOnly, async (req, res) => {
  try {
    const { adminNote } = req.body;
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id }, include: { asset: true } });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.status !== 'PENDING') return res.status(400).json({ error: 'Can only approve pending bookings' });

    const [updatedBooking] = await prisma.$transaction([
      prisma.booking.update({ where: { id: req.params.id }, data: { status: 'APPROVED', adminNote } }),
      prisma.asset.update({
        where: { id: booking.assetId },
        data: {
          availableQuantity: { decrement: booking.quantity },
          status: booking.asset.availableQuantity - booking.quantity <= 0 ? 'UNAVAILABLE' : 'PARTIALLY_AVAILABLE',
        },
      }),
    ]);

    await prisma.auditLog.create({ data: { userId: req.user.id, assetId: booking.assetId, action: 'BOOKING_APPROVED', details: `Approved booking ${req.params.id}` } });
    res.json(updatedBooking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reject booking (admin)
router.patch('/:id/reject', authenticate, adminOnly, async (req, res) => {
  try {
    const { adminNote } = req.body;
    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status: 'REJECTED', adminNote },
    });

    await prisma.auditLog.create({ data: { userId: req.user.id, action: 'BOOKING_REJECTED', details: `Rejected booking ${req.params.id}` } });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Issue asset (admin)
router.patch('/:id/issue', authenticate, adminOnly, async (req, res) => {
  try {
    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status: 'ISSUED', issuedAt: new Date() },
    });

    await prisma.auditLog.create({ data: { userId: req.user.id, assetId: booking.assetId, action: 'ASSET_ISSUED', details: `Issued booking ${req.params.id}` } });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Return asset (admin)
router.patch('/:id/return', authenticate, adminOnly, async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id }, include: { asset: true } });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const newAvailable = booking.asset.availableQuantity + booking.quantity;
    const newStatus = newAvailable >= booking.asset.totalQuantity ? 'AVAILABLE' : 'PARTIALLY_AVAILABLE';

    const [updatedBooking] = await prisma.$transaction([
      prisma.booking.update({ where: { id: req.params.id }, data: { status: 'RETURNED', returnedAt: new Date() } }),
      prisma.asset.update({ where: { id: booking.assetId }, data: { availableQuantity: newAvailable, status: newStatus } }),
    ]);

    await prisma.auditLog.create({ data: { userId: req.user.id, assetId: booking.assetId, action: 'ASSET_RETURNED', details: `Returned booking ${req.params.id}` } });
    res.json(updatedBooking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
