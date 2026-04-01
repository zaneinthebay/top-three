const express = require('express');
const router = express.Router();
const db = require('../db/db');
const authMiddleware = require('../middleware/auth');

// Get today's prompt + whether user has responded
router.get('/today', authMiddleware, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const promptResult = await db.query(
      'SELECT * FROM prompts WHERE scheduled_date = $1',
      [today]
    );

    if (promptResult.rows.length === 0) {
      return res.status(404).json({ error: 'No prompt for today' });
    }

    const prompt = promptResult.rows[0];

    // Check if user has already responded
    const responseResult = await db.query(
      'SELECT id FROM responses WHERE user_id = $1 AND prompt_id = $2',
      [req.userId, prompt.id]
    );

    res.json({
      prompt,
      hasResponded: responseResult.rows.length > 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get prompt by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM prompts WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
