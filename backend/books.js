const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'kitap_platformu_secret';

// Token doğrulayıcı middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Token eksik' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ success: false, message: 'Geçersiz token' });
    req.user = user;
    next();
  });
};

// Kitap Ekle
router.post('/', authenticateToken, (req, res) => {
  const { title, author, description, cover_url } = req.body;
  const added_by_user_id = req.user.id;

  const sql = `INSERT INTO books (title, author, description, cover_url, added_by_user_id)
               VALUES (?, ?, ?, ?, ?)`;

  db.query(sql, [title, author, description, cover_url, added_by_user_id], (err, result) => {
    if (err) {
      console.error('[BOOK ADD] Hata:', err);
      return res.status(500).json({ success: false, message: 'Kitap eklenirken hata oluştu.' });
    }

    res.status(201).json({ success: true, message: 'Kitap başarıyla eklendi!' });
  });
});

module.exports = router;
