const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');

// 獲取總計數據
router.get('/totals', authMiddleware, async (req, res) => {
  try {
    const [users] = await pool.query('SELECT COUNT(*) as count FROM Users');
    const [owners] = await pool.query('SELECT COUNT(*) as count FROM Owners');
    const [vehicles] = await pool.query('SELECT COUNT(*) as count FROM Vehicles');
    const [trips] = await pool.query('SELECT COUNT(*) as count FROM Trips');

    res.json({
      totalUsers: users[0].count,
      totalDrivers: owners[0].count,
      totalVehicles: vehicles[0].count,
      totalTrips: trips[0].count,
    });
  } catch (error) {
    console.error('獲取總計數據錯誤:', error);
    res.status(500).json({ error: '伺服器錯誤', details: error.message });
  }
});

// 獲取營收數據（日/月/年）
router.get('/revenue/:type', authMiddleware, async (req, res) => {
  try {
    const { type } = req.params;
    const { startDate, endDate } = req.query;

    let groupBy, dateFormat;
    switch (type) {
      case 'daily':
        groupBy = 'DATE(requested_at)';
        dateFormat = '%Y-%m-%d';
        break;
      case 'monthly':
        groupBy = 'DATE_FORMAT(requested_at, "%Y-%m")';
        dateFormat = '%Y-%m';
        break;
      case 'yearly':
        groupBy = 'YEAR(requested_at)';
        dateFormat = '%Y';
        break;
      default:
        return res.status(400).json({ error: '無效的類型' });
    }

    let query = `
      SELECT 
        ${groupBy} as date,
        SUM(CASE WHEN paid_with = 'card' THEN COALESCE(paid_amount, fare, 0) ELSE 0 END) as card_revenue,
        SUM(CASE WHEN paid_with = 'points' THEN COALESCE(paid_amount, fare, 0) ELSE 0 END) as points_revenue,
        SUM(COALESCE(paid_amount, fare, 0)) as total_revenue,
        COUNT(*) as trip_count
      FROM Trips
      WHERE status = 'completed'
        AND requested_at IS NOT NULL
    `;

    const params = [];
    if (startDate) {
      query += ' AND requested_at >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND requested_at <= ?';
      params.push(endDate);
    }

    query += ` GROUP BY ${groupBy} ORDER BY date ASC LIMIT 50`;

    const [results] = await pool.query(query, params);
    res.json(results);
  } catch (error) {
    console.error('獲取營收數據錯誤:', error);
    res.status(500).json({ error: '伺服器錯誤', details: error.message });
  }
});

// 獲取成長趨勢（可自定義時間範圍）
router.get('/growth/:type', authMiddleware, async (req, res) => {
  try {
    const { type } = req.params;
    const { baseDate } = req.query; // 基準日期（可選）
    
    const referenceDate = baseDate ? `'${baseDate}'` : 'CURDATE()';
    
    let currentQuery, previousQuery, currentLabel, previousLabel;
    
    switch (type) {
      case 'daily':
        currentQuery = `
          SELECT 
            COUNT(*) as count,
            COALESCE(SUM(COALESCE(paid_amount, fare)), 0) as revenue
          FROM Trips
          WHERE DATE(requested_at) = DATE(${referenceDate})
            AND status = 'completed'
        `;
        previousQuery = `
          SELECT 
            COUNT(*) as count,
            COALESCE(SUM(COALESCE(paid_amount, fare)), 0) as revenue
          FROM Trips
          WHERE DATE(requested_at) = DATE_SUB(DATE(${referenceDate}), INTERVAL 1 DAY)
            AND status = 'completed'
        `;
        currentLabel = '選定日';
        previousLabel = '前一日';
        break;
        
      case 'weekly':
        currentQuery = `
          SELECT 
            COUNT(*) as count,
            COALESCE(SUM(COALESCE(paid_amount, fare)), 0) as revenue
          FROM Trips
          WHERE YEARWEEK(requested_at, 1) = YEARWEEK(${referenceDate}, 1)
            AND status = 'completed'
        `;
        previousQuery = `
          SELECT 
            COUNT(*) as count,
            COALESCE(SUM(COALESCE(paid_amount, fare)), 0) as revenue
          FROM Trips
          WHERE YEARWEEK(requested_at, 1) = YEARWEEK(DATE_SUB(${referenceDate}, INTERVAL 1 WEEK), 1)
            AND status = 'completed'
        `;
        currentLabel = '選定週';
        previousLabel = '前一週';
        break;
        
      case 'monthly':
        currentQuery = `
          SELECT 
            COUNT(*) as count,
            COALESCE(SUM(COALESCE(paid_amount, fare)), 0) as revenue
          FROM Trips
          WHERE YEAR(requested_at) = YEAR(${referenceDate})
            AND MONTH(requested_at) = MONTH(${referenceDate})
            AND status = 'completed'
        `;
        previousQuery = `
          SELECT 
            COUNT(*) as count,
            COALESCE(SUM(COALESCE(paid_amount, fare)), 0) as revenue
          FROM Trips
          WHERE YEAR(requested_at) = YEAR(DATE_SUB(${referenceDate}, INTERVAL 1 MONTH))
            AND MONTH(requested_at) = MONTH(DATE_SUB(${referenceDate}, INTERVAL 1 MONTH))
            AND status = 'completed'
        `;
        currentLabel = '選定月';
        previousLabel = '前一月';
        break;
        
      case 'yearly':
        currentQuery = `
          SELECT 
            COUNT(*) as count,
            COALESCE(SUM(COALESCE(paid_amount, fare)), 0) as revenue
          FROM Trips
          WHERE YEAR(requested_at) = YEAR(${referenceDate})
            AND status = 'completed'
        `;
        previousQuery = `
          SELECT 
            COUNT(*) as count,
            COALESCE(SUM(COALESCE(paid_amount, fare)), 0) as revenue
          FROM Trips
          WHERE YEAR(requested_at) = YEAR(DATE_SUB(${referenceDate}, INTERVAL 1 YEAR))
            AND status = 'completed'
        `;
        currentLabel = '選定年';
        previousLabel = '前一年';
        break;
        
      default:
        return res.status(400).json({ error: '無效的類型' });
    }
    
    console.log('執行當期查詢:', currentQuery);
    console.log('執行前期查詢:', previousQuery);
    
    const [currentResults] = await pool.query(currentQuery);
    const [previousResults] = await pool.query(previousQuery);
    
    const current = currentResults[0] || { count: 0, revenue: 0 };
    const previous = previousResults[0] || { count: 0, revenue: 0 };
    
    console.log('當期結果:', current);
    console.log('前期結果:', previous);
    
    // 計算增長百分比
    const tripGrowth = previous.count === 0 ? 
      (current.count > 0 ? 100 : 0) : 
      ((current.count - previous.count) / previous.count * 100).toFixed(1);
    const revenueGrowth = previous.revenue === 0 ? 
      (current.revenue > 0 ? 100 : 0) :
      ((current.revenue - previous.revenue) / previous.revenue * 100).toFixed(1);
    
    const result = {
      current: {
        label: currentLabel,
        trips: current.count,
        revenue: parseFloat(current.revenue)
      },
      previous: {
        label: previousLabel,
        trips: previous.count,
        revenue: parseFloat(previous.revenue)
      },
      growth: {
        trips: parseFloat(tripGrowth),
        revenue: parseFloat(revenueGrowth)
      }
    };
    
    console.log('返回結果:', result);
    
    res.json(result);
  } catch (error) {
    console.error('獲取成長趨勢錯誤:', error);
    res.status(500).json({ error: '伺服器錯誤', details: error.message, stack: error.stack });
  }
});

// 獲取付款方式分布（僅信用卡和點數）
router.get('/payment-distribution', authMiddleware, async (req, res) => {
  try {
    const [results] = await pool.query(`
      SELECT 
        paid_with,
        COUNT(*) as count,
        COALESCE(SUM(COALESCE(paid_amount, fare)), 0) as total_amount
      FROM Trips
      WHERE status = 'completed'
        AND paid_with IN ('card', 'points')
      GROUP BY paid_with
    `);
    
    console.log('付款方式分布查詢結果:', results);
    
    // 計算總金額
    const totalAmount = results.reduce((sum, item) => sum + parseFloat(item.total_amount || 0), 0);
    
    // 格式化數據
    const formattedResults = results.map(item => ({
      type: item.paid_with,
      count: item.count,
      amount: parseFloat(item.total_amount || 0),
      percentage: totalAmount > 0 ? ((parseFloat(item.total_amount || 0) / totalAmount) * 100).toFixed(1) : 0
    }));
    
    const result = {
      data: formattedResults,
      totalAmount: totalAmount
    };
    
    console.log('返回結果:', result);
    
    res.json(result);
  } catch (error) {
    console.error('獲取付款方式分布錯誤:', error);
    res.status(500).json({ error: '伺服器錯誤', details: error.message });
  }
});

module.exports = router;