const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db/db');
const redis = require('../redis');
const authMiddleware = require('../middleware/auth');

// Submit response for today's prompt
router.post('/', authMiddleware, async (req, res) => {
  const { promptId, rank1, rank2, rank3 } = req.body;
  if (!promptId || !rank1 || !rank2 || !rank3) {
    return res.status(400).json({ error: 'promptId, rank1, rank2, rank3 required' });
  }

  try {
    // Verify prompt exists
    const promptResult = await db.query('SELECT * FROM prompts WHERE id = $1', [promptId]);
    if (promptResult.rows.length === 0) return res.status(404).json({ error: 'Prompt not found' });
    const prompt = promptResult.rows[0];

    // Check duplicate
    const existing = await db.query(
      'SELECT id FROM responses WHERE user_id = $1 AND prompt_id = $2',
      [req.userId, promptId]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Already responded to this prompt' });
    }

    const shareToken = uuidv4().replace(/-/g, '').slice(0, 16);

    const result = await db.query(
      `INSERT INTO responses (user_id, prompt_id, rank1, rank2, rank3, share_token)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.userId, promptId, rank1, rank2, rank3, shareToken]
    );

    const response = result.rows[0];

    // Update trending in Redis: increment count for each #1 pick
    const trendingKey = `trending:${promptId}`;
    await redis.zincrby(trendingKey, 1, rank1.toLowerCase().trim());
    await redis.expire(trendingKey, 60 * 60 * 24 * 7); // 7 days

    // Generate share text
    const shareText = generateShareText(prompt, response);

    res.status(201).json({ response, shareText });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get friends' responses for a prompt (gated: user must have responded first)
router.get('/friends/:promptId', authMiddleware, async (req, res) => {
  const { promptId } = req.params;

  try {
    // Gate: user must have responded
    const myResponse = await db.query(
      'SELECT * FROM responses WHERE user_id = $1 AND prompt_id = $2',
      [req.userId, promptId]
    );
    if (myResponse.rows.length === 0) {
      return res.status(403).json({
        error: 'Submit your own response first to see your friends\' lists',
        gated: true,
      });
    }

    // Get friends
    const friendsResult = await db.query(
      'SELECT friend_id FROM friendships WHERE user_id = $1',
      [req.userId]
    );
    const friendIds = friendsResult.rows.map((r) => r.friend_id);

    if (friendIds.length === 0) {
      return res.json({ responses: [], myResponse: myResponse.rows[0] });
    }

    const placeholders = friendIds.map((_, i) => `$${i + 2}`).join(',');
    const friendResponses = await db.query(
      `SELECT r.*, u.name, u.profile_picture
       FROM responses r
       JOIN users u ON r.user_id = u.id
       WHERE r.prompt_id = $1 AND r.user_id IN (${placeholders})
       ORDER BY r.created_at ASC`,
      [promptId, ...friendIds]
    );

    // Trending top 3 picks among friends
    const trendingKey = `trending:${promptId}`;
    const trending = await redis.zrevrange(trendingKey, 0, 2, 'WITHSCORES');

    res.json({
      responses: friendResponses.rows,
      myResponse: myResponse.rows[0],
      trending: parseTrending(trending),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get response by share token (public — for share links)
router.get('/share/:token', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT r.rank1, r.rank2, r.rank3, r.share_token, r.created_at,
              u.name, u.profile_picture,
              p.text, p.full_text, p.emoji, p.scheduled_date
       FROM responses r
       JOIN users u ON r.user_id = u.id
       JOIN prompts p ON r.prompt_id = p.id
       WHERE r.share_token = $1`,
      [req.params.token]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

function generateShareText(prompt, response) {
  return (
    `${prompt.emoji || '🏆'} My top 3 ${prompt.text}:\n` +
    `1. ${response.rank1}\n` +
    `2. ${response.rank2}\n` +
    `3. ${response.rank3}\n\n` +
    `What are yours? Submit to see mine 👇\n` +
    `https://topthree.app/share/${response.share_token}`
  );
}

function parseTrending(arr) {
  const result = [];
  for (let i = 0; i < arr.length; i += 2) {
    result.push({ item: arr[i], count: parseInt(arr[i + 1]) });
  }
  return result;
}

module.exports = router;
