const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');

// 獲取所有車輛（帶篩選和搜尋）
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, search_type, search_value } = req.query;
    
    let query = `
      SELECT 
        v.*,
        o.name AS owner_name,
        o.phone AS owner_phone,
        o.email AS owner_email
      FROM Vehicles v
      LEFT JOIN Owners o ON v.owner_id = o.owner_id
      WHERE 1=1
    `;
    const params = [];
    
    if (status) {
      query += ' AND v.status = ?';
      params.push(status);
    }
    
    // 根據搜尋類型添加條件
    if (search_type && search_value) {
      switch (search_type) {
        case 'plate_number':
          query += ' AND v.plate_number LIKE ?';
          params.push(`%${search_value}%`);
          break;
        case 'model':
          query += ' AND v.model LIKE ?';
          params.push(`%${search_value}%`);
          break;
        case 'owner_name':
          query += ' AND o.name LIKE ?';
          params.push(`%${search_value}%`);
          break;
        case 'owner_id':
          query += ' AND v.owner_id = ?';
          params.push(search_value);
          break;
      }
    }
    
    query += ' ORDER BY v.vehicle_id DESC';
    
    const [vehicles] = await pool.query(query, params);
    res.json(vehicles);
  } catch (error) {
    console.error('獲取車輛列表錯誤:', error);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// 獲取單一車輛詳情
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const [vehicles] = await pool.query(`
      SELECT 
        v.*,
        o.name AS owner_name,
        o.phone AS owner_phone,
        o.email AS owner_email
      FROM Vehicles v
      LEFT JOIN Owners o ON v.owner_id = o.owner_id
      WHERE v.vehicle_id = ?
    `, [id]);
    
    if (vehicles.length === 0) {
      return res.status(404).json({ error: '車輛不存在' });
    }
    
    res.json(vehicles[0]);
  } catch (error) {
    console.error('獲取車輛詳情錯誤:', error);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// 更新車輛狀態
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // 驗證狀態值
    const validStatuses = ['available', 'on_trip', 'charging', 'offline'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: '無效的狀態值' });
    }
    
    await pool.query(
      'UPDATE Vehicles SET status = ? WHERE vehicle_id = ?',
      [status, id]
    );
    
    res.json({ message: '車輛狀態已更新' });
  } catch (error) {
    console.error('更新車輛狀態錯誤:', error);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

module.exports = router;