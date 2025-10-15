const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');

// 獲取所有退款請求（帶搜尋功能）
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, search_type, search_value } = req.query;
    
    console.log('=== 退款查詢請求 ===');
    console.log('原始查詢參數:', req.query);
    console.log('status:', status, 'type:', typeof status);
    console.log('search_type:', search_type);
    console.log('search_value:', search_value);
    
    let query = `
      SELECT 
        rr.refund_request_id,
        rr.trip_id,
        rr.reason,
        rr.requested_refund_twd,
        rr.requested_refund_points,
        rr.approved_refund_twd,
        rr.approved_refund_points,
        rr.status,
        rr.decision_note,
        rr.created_at,
        rr.decided_at,
        t.user_id AS rider_id,
        t.vehicle_id,
        u.name AS rider_name,
        v.owner_id,
        o.name AS driver_name
      FROM Refund_Requests rr
      JOIN Trips t ON rr.trip_id = t.trip_id
      LEFT JOIN Users u ON t.user_id = u.user_id
      LEFT JOIN Vehicles v ON t.vehicle_id = v.vehicle_id
      LEFT JOIN Owners o ON v.owner_id = o.owner_id
      WHERE 1=1
    `;
    
    const params = [];
    
    // 狀態篩選 - 修正條件判斷
    if (status !== undefined && status !== null && status !== '') {
      console.log('添加狀態篩選:', status);
      query += ' AND rr.status = ?';
      params.push(status);
    } else {
      console.log('未添加狀態篩選');
    }
    
    // 搜尋條件
    if (search_type && search_value !== undefined && search_value !== null && search_value !== '') {
      console.log('添加搜尋條件:', search_type, search_value);
      switch (search_type) {
        case 'user_id':
          query += ' AND (t.user_id = ? OR v.owner_id = ?)';
          params.push(search_value, search_value);
          break;
        case 'trip_id':
          query += ' AND rr.trip_id = ?';
          params.push(search_value);
          break;
        case 'user_name':
          query += ' AND (u.name LIKE ? OR o.name LIKE ?)';
          params.push(`%${search_value}%`, `%${search_value}%`);
          break;
      }
    } else {
      console.log('未添加搜尋條件');
    }
    
    query += ' ORDER BY rr.created_at DESC';
    
    console.log('最終查詢 SQL:', query);
    console.log('查詢參數:', params);
    
    const [refunds] = await pool.query(query, params);
    
    console.log('查詢結果數量:', refunds.length);
    console.log('前3筆結果狀態:', refunds.slice(0, 3).map(r => ({ id: r.refund_request_id, status: r.status })));
    
    res.json(refunds);
  } catch (error) {
    console.error('獲取退款請求錯誤:', error);
    res.status(500).json({ error: '伺服器錯誤', details: error.message });
  }
});

// 更新退款狀態
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approved_refund_twd, approved_refund_points, decision_note } = req.body;
    
    console.log('=== 更新退款請求 ===');
    console.log('退款ID:', id);
    console.log('新狀態:', status);
    console.log('核准金額:', approved_refund_twd);
    console.log('核准點數:', approved_refund_points);
    console.log('決定原因:', decision_note);
    
    // 驗證狀態
    const validStatuses = ['pending', 'approved', 'rejected', 'on_hold', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: '無效的狀態值' });
    }
    
    // 構建更新查詢
    let query = 'UPDATE Refund_Requests SET status = ?, decided_at = NOW()';
    const params = [status];
    
    // 添加決定原因
    if (decision_note !== undefined && decision_note !== null) {
      query += ', decision_note = ?';
      params.push(decision_note);
    }
    
    // 如果是核准或暫緩，記錄核准金額
    if ((status === 'approved' || status === 'on_hold')) {
      if (approved_refund_twd !== undefined && approved_refund_twd !== null) {
        query += ', approved_refund_twd = ?';
        params.push(approved_refund_twd);
      }
      
      if (approved_refund_points !== undefined && approved_refund_points !== null) {
        query += ', approved_refund_points = ?';
        params.push(approved_refund_points);
      }
    }
    
    query += ' WHERE refund_request_id = ?';
    params.push(id);
    
    console.log('執行更新 SQL:', query);
    console.log('更新參數:', params);
    
    const [result] = await pool.query(query, params);
    
    console.log('更新結果:', result);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '退款請求不存在' });
    }
    
    res.json({ message: '退款狀態已更新', status });
  } catch (error) {
    console.error('更新退款狀態錯誤:', error);
    res.status(500).json({ error: '伺服器錯誤', details: error.message });
  }
});

module.exports = router;