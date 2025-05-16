const express = require('express');
const router = express.Router();
const { askGemini } = require('../controllers/geminiController');

router.post('/ask', askGemini);

module.exports = router;
