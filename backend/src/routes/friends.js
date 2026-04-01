const express = require('express');
const router = express.Router();
const db = require('../db/db');
const authMiddleware = require('../middleware/auth');

// Get my friends list
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT u.id, u.name, u.profile_picture
       FROM friendships f
       JOIN users u ON f.friend_id = u.id
       WHERE f.user_id = $1
       ORDER BY u.name`,
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get friends who have responded to today's prompt (without showing their answers — for pre-submit teaser)
router.get('/activity/:promptId', authMiddleware, async (req, res) => {
  try {
    const { promptId } = req.params;

    const result = await db.query(
      `SELECT u.id, u.name, u.profile_picture, r.created_at AS responded_at
       FROM friendships f
       JOIN users u ON f.friend_id = u.id
       LEFT JOIN responses r ON r.user_id = u.id AND r.prompt_id = $2
       WHERE f.user_id = $1
       ORDER BY r.created_at DESC NULLS LAST`,
      [req.userId, promptId]
    );

    // Check if current user has responded
    const myResponse = await db.query(
      'SELECT id FROM responses WHERE user_id = $1 AND prompt_id = $2',
      [req.userId, promptId]
    );

    const hasResponded = myResponse.rows.length > 0;
    const respondedCount = result.rows.filter((r) => r.responded_at).length;

    res.json({
      friends: result.rows.map((f) => ({
        id: f.id,
        name: f.name,
        profilePicture: f.profile_picture,
        hasResponded: !!f.responded_at,
        // Only show WHEN they responded if current user has also responded
        respondedAt: hasResponded ? f.responded_at : null,
      })),
      respondedCount,
      hasResponded,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
