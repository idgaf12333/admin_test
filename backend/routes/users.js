const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');

// 獲取所有用戶（乘客 + 車主）
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { type } = req.query;
    let result = [];
    
    if (!type || type === 'rider') {
      // 獲取乘客及其行程數
      const [riders] = await pool.query(`
        SELECT 
          u.user_id AS id,
          u.name,
          u.phone,
          u.email,
          u.created_at,
          'rider' AS user_type,
          COUNT(t.trip_id) AS trip_count
        FROM Users u
        LEFT JOIN Trips t ON u.user_id = t.user_id
        GROUP BY u.user_id, u.name, u.phone, u.email, u.created_at
        ORDER BY u.user_id DESC
      `);
      result = [...result, ...riders];
    }
    
    if (!type || type === 'driver') {
      // 獲取車主及其車輛數
      const [owners] = await pool.query(`
        SELECT 
          o.owner_id AS id,
          o.name,
          o.phone,
          o.email,
          o.registered_at AS created_at,
          'driver' AS user_type,
          COUNT(v.vehicle_id) AS vehicle_count
        FROM Owners o
        LEFT JOIN Vehicles v ON o.owner_id = v.owner_id
        GROUP BY o.owner_id, o.name, o.phone, o.email, o.registered_at
        ORDER BY o.owner_id DESC
      `);
      result = [...result, ...owners];
    }
    
    console.log('找到用戶數:', result.length);
    res.json(result);
  } catch (error) {
    console.error('獲取用戶列表錯誤:', error);
    res.status(500).json({ error: '伺服器錯誤', details: error.message });
  }
});

// 獲取單一用戶詳情
router.get('/:type/:id', authMiddleware, async (req, res) => {
  try {
    const { type, id } = req.params;
    
    if (type === 'rider') {
      const [users] = await pool.query(`
        SELECT 
          user_id AS id,
          name,
          phone,
          email,
          created_at,
          'rider' AS user_type
        FROM Users 
        WHERE user_id = ?
      `, [id]);
      
      if (users.length === 0) {
        return res.status(404).json({ error: '乘客不存在' });
      }
      return res.json(users[0]);
    } else if (type === 'driver') {
      const [owners] = await pool.query(`
        SELECT 
          owner_id AS id,
          name,
          phone,
          email,
          registered_at AS created_at,
          'driver' AS user_type
        FROM Owners 
        WHERE owner_id = ?
      `, [id]);
      
      if (owners.length === 0) {
        return res.status(404).json({ error: '車主不存在' });
      }
      return res.json(owners[0]);
    } else {
      return res.status(400).json({ error: '無效的用戶類型' });
    }
  } catch (error) {
    console.error('獲取用戶詳情錯誤:', error);
    res.status(500).json({ error: '伺服器錯誤', details: error.message });
  }
});

// 獲取車主的所有車輛
router.get('/driver/:id/vehicles', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('獲取車主車輛, 車主 ID:', id);
    
    const [vehicles] = await pool.query(`
      SELECT 
        vehicle_id,
        owner_id,
        plate_number,
        model,
        battery_capacity_kWh,
        current_charge_percent,
        location_lat,
        location_lng,
        status,
        updated_at
      FROM Vehicles 
      WHERE owner_id = ? 
      ORDER BY vehicle_id DESC
    `, [id]);
    
    console.log('找到車輛數:', vehicles.length);
    res.json(vehicles);
  } catch (error) {
    console.error('獲取車主車輛錯誤:', error);
    res.status(500).json({ error: '伺服器錯誤', details: error.message });
  }
});

// 獲取乘客的所有行程
router.get('/rider/:id/trips', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('獲取乘客行程, 乘客 ID:', id);
    
    const [trips] = await pool.query(`
      SELECT 
        t.*,
        v.plate_number,
        v.model AS vehicle_model,
        o.name AS driver_name
      FROM Trips t
      LEFT JOIN Vehicles v ON t.vehicle_id = v.vehicle_id
      LEFT JOIN Owners o ON v.owner_id = o.owner_id
      WHERE t.user_id = ? 
      ORDER BY t.requested_at DESC
    `, [id]);
    
    console.log('找到行程數:', trips.length);
    res.json(trips);
  } catch (error) {
    console.error('獲取乘客行程錯誤:', error);
    res.status(500).json({ error: '伺服器錯誤', details: error.message });
  }
});

module.exports = router;