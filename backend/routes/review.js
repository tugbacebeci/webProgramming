const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db');

const SECRET_KEY = 'kitap_platformu_secret';

// Token doğrulama middleware
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

// POST /api/reviews/add → yorum ekle
router.post('/add', authenticateToken, (req, res) => {
  const { book_id, rating, comment } = req.body;
  const user_id = req.user.id;

  if (!book_id || !rating || !comment || !user_id) {
    console.log('[REVIEW] Eksik veri:', { book_id, rating, comment, user_id });
    return res.status(400).json({ success: false, message: 'Eksik veri' });
  }

  const sql = 'INSERT INTO reviews (book_id, user_id, rating, comment) VALUES (?, ?, ?, ?)';
  db.query(sql, [book_id, user_id, rating, comment], (err, result) => {
    if (err) {
      console.error('[REVIEW] Ekleme hatası:', err);
      return res.status(500).json({ success: false, message: 'Yorum eklenemedi' });
    }

    console.log('[REVIEW] Yorum eklendi:', { book_id, user_id, rating, comment });
    res.status(201).json({ success: true, message: 'Yorum başarıyla eklendi' });
  });
});

// GET /api/reviews/:book_id → yorumları getir
router.get('/:book_id', authenticateToken, (req, res) => {
  const bookId = req.params.book_id;

  const sql = `
  SELECT r.id, r.user_id, r.rating, r.comment, r.created_at, u.username 
  FROM reviews r 
  JOIN users u ON r.user_id = u.id 
  WHERE r.book_id = ?
  ORDER BY r.created_at DESC
`;


  db.query(sql, [bookId], (err, results) => {
    if (err) {
      console.error('[REVIEW] Getirme hatası:', err);
      return res.status(500).json({ success: false, message: 'Yorumlar alınamadı' });
    }

    res.json({ success: true, reviews: results });
  });
});

// DELETE /api/reviews/:id → yorumu sil
router.delete('/:id', authenticateToken, (req, res) => {
    const reviewId = req.params.id;
    const userId = req.user.id;
  
    const sql = 'DELETE FROM reviews WHERE id = ? AND user_id = ?';
    db.query(sql, [reviewId, userId], (err, result) => {
      if (err) {
        console.error('[DELETE REVIEW] Hata:', err);
        return res.status(500).json({ success: false, message: 'Yorum silinirken hata oluştu.' });
      }
  
      if (result.affectedRows === 0) {
        return res.status(403).json({ success: false, message: 'Bu yorumu silme yetkiniz yok.' });
      }
  
      return res.json({ success: true, message: 'Yorum başarıyla silindi.' });
    });
  });
  
  // PUT /api/reviews/:id → yorumu güncelle
router.put('/:id', authenticateToken, (req, res) => {
    const reviewId = req.params.id;
    const userId = req.user.id;
    const { rating, comment } = req.body;
  
    if (!rating || !comment) {
      return res.status(400).json({ success: false, message: 'Puan ve yorum zorunludur.' });
    }
  
    const sql = 'UPDATE reviews SET rating = ?, comment = ? WHERE id = ? AND user_id = ?';
    db.query(sql, [rating, comment, reviewId, userId], (err, result) => {
      if (err) {
        console.error('[UPDATE REVIEW] Hata:', err);
        return res.status(500).json({ success: false, message: 'Yorum güncellenemedi.' });
      }
  
      if (result.affectedRows === 0) {
        return res.status(403).json({ success: false, message: 'Bu yorumu güncelleme yetkiniz yok.' });
      }
  
      return res.json({ success: true, message: 'Yorum başarıyla güncellendi.' });
    });
  });
  

module.exports = router;
