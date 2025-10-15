const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// 管理員登入
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: '請提供電子郵件和密碼' });
    }

    const [admins] = await pool.query(
      'SELECT * FROM AdminUsers WHERE email = ? AND is_active = TRUE',
      [email]
    );

    if (admins.length === 0) {
      return res.status(401).json({ error: '電子郵件或密碼錯誤' });
    }

    const admin = admins[0];
    const isValidPassword = await bcrypt.compare(password, admin.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: '電子郵件或密碼錯誤' });
    }

    const token = jwt.sign(
      { adminId: admin.admin_id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      admin: {
        id: admin.admin_id,
        name: admin.name,
        email: admin.email
      }
    });
  } catch (error) {
    console.error('登入錯誤:', error);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// 創建測試管理員帳號（僅供開發使用）
router.post('/create-admin', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO AdminUsers (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    res.json({ message: '管理員創建成功', adminId: result.insertId });
  } catch (error) {
    console.error('創建管理員錯誤:', error);
    res.status(500).json({ error: '創建失敗' });
  }
});

module.exports = router;