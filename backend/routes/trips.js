const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');

// 獲取所有行程（帶篩選和搜尋）
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, search_type, search_value } = req.query;
    
    console.log('=== 行程查詢請求 ===');
    console.log('原始查詢參數:', req.query);
    
    let query = `
      SELECT 
        t.*,
        u.name AS rider_name,
        u.phone AS rider_phone,
        v.plate_number,
        v.model AS vehicle_model,
        o.name AS driver_name,
        o.phone AS driver_phone
      FROM Trips t
      LEFT JOIN Users u ON t.user_id = u.user_id
      LEFT JOIN Vehicles v ON t.vehicle_id = v.vehicle_id
      LEFT JOIN Owners o ON v.owner_id = o.owner_id
      WHERE 1=1
    `;
    
    const params = [];
    
    // 狀態篩選
    if (status && status.trim() !== '') {
      console.log('添加狀態篩選:', status);
      query += ' AND t.status = ?';
      params.push(status);
    }
    
    // 搜尋條件
    if (search_type && search_value && search_value.trim() !== '') {
      console.log('添加搜尋條件:', search_type, search_value);
      switch (search_type) {
        case 'trip_id':
          query += ' AND t.trip_id = ?';
          params.push(search_value);
          break;
        case 'user_id':
          query += ' AND t.user_id = ?';
          params.push(search_value);
          break;
        case 'vehicle_id':
          query += ' AND t.vehicle_id = ?';
          params.push(search_value);
          break;
        case 'owner_id':
          query += ' AND v.owner_id = ?';
          params.push(search_value);
          break;
        case 'user_name':
          query += ' AND (u.name LIKE ? OR o.name LIKE ?)';
          params.push(`%${search_value}%`, `%${search_value}%`);
          break;
        case 'plate_number':
          query += ' AND v.plate_number LIKE ?';
          params.push(`%${search_value}%`);
          break;
        case 'vehicle_model':
          query += ' AND v.model LIKE ?';
          params.push(`%${search_value}%`);
          break;
      }
    }
    
    query += ' ORDER BY t.requested_at DESC';
    
    console.log('最終查詢 SQL:', query);
    console.log('查詢參數:', params);
    
    const [trips] = await pool.query(query, params);
    
    console.log('查詢結果數量:', trips.length);
    
    res.json(trips);
  } catch (error) {
    console.error('獲取行程列表錯誤:', error);
    res.status(500).json({ error: '伺服器錯誤', details: error.message });
  }
});

// 獲取單一行程詳情
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [trips] = await pool.query(`
      SELECT 
        t.*,
        u.name AS rider_name,
        u.phone AS rider_phone,
        u.email AS rider_email,
        v.plate_number,
        v.model AS vehicle_model,
        v.battery_capacity_kWh,
        o.owner_id,
        o.name AS driver_name,
        o.phone AS driver_phone,
        o.email AS driver_email
      FROM Trips t
      LEFT JOIN Users u ON t.user_id = u.user_id
      LEFT JOIN Vehicles v ON t.vehicle_id = v.vehicle_id
      LEFT JOIN Owners o ON v.owner_id = o.owner_id
      WHERE t.trip_id = ?
    `, [id]);
    
    if (trips.length === 0) {
      return res.status(404).json({ error: '行程不存在' });
    }
    
    res.json(trips[0]);
  } catch (error) {
    console.error('獲取行程詳情錯誤:', error);
    res.status(500).json({ error: '伺服器錯誤', details: error.message });
  }
});

// 更新行程狀態
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    console.log('更新行程狀態:', { id, status });
    
    // 驗證狀態值
    const validStatuses = ['en_route', 'ongoing', 'on_trip', 'to_pickup', 'to_dropoff', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: '無效的狀態值' });
    }
    
    // 根據狀態更新相應的時間戳
    let query = 'UPDATE Trips SET status = ?';
    const params = [status];
    
    if (status === 'on_trip' && !req.body.skip_timestamp) {
      query += ', picked_up_at = NOW()';
    } else if (status === 'completed' && !req.body.skip_timestamp) {
      query += ', dropped_off_at = NOW()';
    }
    
    query += ' WHERE trip_id = ?';
    params.push(id);
    
    const [result] = await pool.query(query, params);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '行程不存在' });
    }
    
    res.json({ message: '行程狀態已更新' });
  } catch (error) {
    console.error('更新行程狀態錯誤:', error);
    res.status(500).json({ error: '伺服器錯誤', details: error.message });
  }
});

module.exports = router;