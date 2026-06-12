const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, adminOnly } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/dashboard', authenticate, adminOnly, async (req, res) => {
  try {
    const [totalAssets, totalBookings, pendingBookings, activeBookings, overdueBookings, topAssets, bookingsByStatus, recentActivity] = await Promise.all([
      prisma.asset.count(),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.booking.count({ where: { status: 'ISSUED' } }),
      prisma.booking.count({ where: { status: 'ISSUED', endDate: { lt: new Date() } } }),
      prisma.booking.groupBy({
        by: ['assetId'],
        _count: { assetId: true },
        orderBy: { _count: { assetId: 'desc' } },
        take: 5,
      }),
      prisma.booking.groupBy({ by: ['status'], _count: { status: true } }),
      prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 10, include: { user: { select: { name: true } } } }),
    ]);

    // Enrich top assets with names
    const assetIds = topAssets.map(a => a.assetId);
    const assetDetails = await prisma.asset.findMany({ where: { id: { in: assetIds } }, select: { id: true, name: true, category: true } });
    const assetMap = Object.fromEntries(assetDetails.map(a => [a.id, a]));
    const enrichedTopAssets = topAssets.map(a => ({ ...assetMap[a.assetId], bookingCount: a._count.assetId }));

    // Monthly booking trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyBookings = await prisma.booking.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true, status: true },
    });
    const monthlyData = {};
    monthlyBookings.forEach(b => {
      const key = `${b.createdAt.getFullYear()}-${String(b.createdAt.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[key] = (monthlyData[key] || 0) + 1;
    });

    res.json({
      summary: { totalAssets, totalBookings, pendingBookings, activeBookings, overdueBookings },
      topAssets: enrichedTopAssets,
      bookingsByStatus,
      monthlyTrend: Object.entries(monthlyData).map(([month, count]) => ({ month, count })).sort((a, b) => a.month.localeCompare(b.month)),
      recentActivity,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Asset utilization rates
router.get('/utilization', authenticate, adminOnly, async (req, res) => {
  try {
    const assets = await prisma.asset.findMany({ select: { id: true, name: true, category: true, totalQuantity: true, availableQuantity: true } });
    const utilization = assets.map(a => ({
      ...a,
      utilizationRate: (((a.totalQuantity - a.availableQuantity) / a.totalQuantity) * 100).toFixed(1),
    }));
    res.json(utilization);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
