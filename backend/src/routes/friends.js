const express = require('express');
const router = express.Router();
const db = require('../db/db');
const authMiddleware = require('../middleware/auth');

// Get friends list with their response status for today
router.get('/', authMiddleware, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const result = await db.query(
      `SELECT u.id, u.name, u.profile_picture,
              CASE WHEN r.id IS NOT NULL THEN true ELSE false END as has_responded_today
       FROM friendships f
       JOIN users u ON f.friend_id = u.id
       LEFT JOIN responses r ON r.user_id = u.id
         AND r.prompt_id = (SELECT id FROM prompts WHERE scheduled_date = $2 LIMIT 1)
       WHERE f.user_id = $1
       ORDER BY has_responded_today DESC, u.name ASC`,
      [req.userId, today]
    );

    res.json({ friends: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
