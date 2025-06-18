const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth'); 
const bookRoutes = require('./routes/book');
const reviewRoutes = require('./routes/review');
const app = express();

app.use(cors({
  origin: '*',           // ← Tüm kaynaklara izin ver
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json()); // JSON body'leri okumak için

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/reviews', reviewRoutes);

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
