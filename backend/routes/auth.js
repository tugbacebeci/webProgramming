const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db'); // Veritabanı bağlantısı

const SECRET_KEY = 'kitap_platformu_secret'; // .env dosyasına taşınacak

// Kullanıcı Kayıt (Register)
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = 'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)';
        db.query(sql, [username, email, hashedPassword], (err, result) => {
            if (err) {
                console.error('[REGISTER] Hata:', err);
                return res.status(500).json({ success: false, message: 'Kayıt sırasında hata oluştu.' });
            }

            return res.status(201).json({ success: true, message: 'Kayıt başarılı!' });
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Sunucu hatası.' });
    }
});

// Kullanıcı Giriş (Login)
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], async (err, results) => {
        if (err || results.length === 0) {
            return res.status(401).json({ success: false, message: 'Kullanıcı bulunamadı.' });
        }

        const user = results[0];
        const match = await bcrypt.compare(password, user.password_hash);

        if (!match) {
            return res.status(401).json({ success: false, message: 'Şifre yanlış.' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username },
            SECRET_KEY,
            { expiresIn: '2h' }
        );

        return res.json({ success: true, token });
    });
});

// Token doğrulayıcı middleware (başka dosyalarda kullanılabilir)
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Token bulunamadı' });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ success: false, message: 'Token geçersiz' });
        req.user = user;
        next();
    });
};

router.get('/profile', authenticateToken, (req, res) => {
    res.json({
      success: true,
      user: req.user  // login sırasında JWT içine koyduğumuz bilgiler
    });
  });
  

module.exports = router;
