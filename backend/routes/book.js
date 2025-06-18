const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db');

const SECRET_KEY = 'kitap_platformu_secret';

// Middleware: Token doğrulama
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ success: false, message: 'Token eksik' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ success: false, message: 'Token geçersiz' });
    req.user = user;
    next();
  });
};

// POST /api/books/add → Kitap ekle
router.post('/add', authenticateToken, (req, res) => {
  const { title, author, description, cover_url } = req.body;
  const added_by_user_id = req.user.id;

  const sql = 'INSERT INTO books (title, author, description, cover_url, added_by_user_id) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [title, author, description, cover_url, added_by_user_id], (err, result) => {
    if (err) {
      console.error('[BOOKS] Kitap ekleme hatası:', err);
      return res.status(500).json({ success: false, message: 'Kitap eklenemedi' });
    }

    res.status(201).json({ success: true, message: 'Kitap başarıyla eklendi' });
  });
});

// Tüm kitapları listele (korumalı)
router.get('/', authenticateToken, (req, res) => {
    console.log("[BOOKS] Kitap listesi isteniyor, user:", req.user);
    const sql = 'SELECT * FROM books';
    db.query(sql, (err, results) => {
      if (err) {
        console.error('[BOOKS] Listeleme hatası:', err);
        return res.status(500).json({ success: false, message: 'Kitaplar alınamadı' });
      }
  
      res.json({ success: true, books: results });
    });
  });
  

module.exports = router;
