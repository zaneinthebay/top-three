const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');
const db = require('../db/db');
const authMiddleware = require('../middleware/auth');

// Facebook Login — exchange FB access token for app JWT
router.post('/facebook', async (req, res) => {
  const { accessToken, expoPushToken } = req.body;
  if (!accessToken) return res.status(400).json({ error: 'accessToken required' });

  try {
    // Verify token with Facebook Graph API
    const fbRes = await fetch(
      `https://graph.facebook.com/me?fields=id,name,picture&access_token=${accessToken}`
    );
    const fbUser = await fbRes.json();

    if (fbUser.error) {
      return res.status(401).json({ error: 'Invalid Facebook token' });
    }

    const { id: facebookId, name, picture } = fbUser;
    const profilePicture = picture?.data?.url || null;

    // Upsert user
    const result = await db.query(
      `INSERT INTO users (facebook_id, name, profile_picture, expo_push_token)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (facebook_id)
       DO UPDATE SET
         name = EXCLUDED.name,
         profile_picture = EXCLUDED.profile_picture,
         expo_push_token = COALESCE(EXCLUDED.expo_push_token, users.expo_push_token),
         updated_at = NOW()
       RETURNING *`,
      [facebookId, name, profilePicture, expoPushToken || null]
    );

    const user = result.rows[0];

    // Sync Facebook friends who are also on the app
    try {
      const friendsRes = await fetch(
        `https://graph.facebook.com/me/friends?access_token=${accessToken}&fields=id`
      );
      const friendsData = await friendsRes.json();
      const friendFbIds = (friendsData.data || []).map((f) => f.id);

      if (friendFbIds.length > 0) {
        const placeholders = friendFbIds.map((_, i) => `$${i + 1}`).join(',');
        const friendUsers = await db.query(
          `SELECT id FROM users WHERE facebook_id IN (${placeholders})`,
          friendFbIds
        );

        for (const friend of friendUsers.rows) {
          // Insert both directions (ignore conflicts)
          await db.query(
            `INSERT INTO friendships (user_id, friend_id) VALUES ($1, $2), ($2, $1)
             ON CONFLICT DO NOTHING`,
            [user.id, friend.id]
          );
        }
      }
    } catch (friendErr) {
      console.warn('Friend sync failed (non-fatal):', friendErr.message);
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '90d' });
    res.json({ token, user: { id: user.id, name: user.name, profilePicture: user.profile_picture } });
  } catch (err) {
    console.error('Auth error:', err);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Update push token
router.post('/push-token', authMiddleware, async (req, res) => {
  const { expoPushToken } = req.body;
  await db.query('UPDATE users SET expo_push_token = $1 WHERE id = $2', [expoPushToken, req.userId]);
  res.json({ ok: true });
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  const result = await db.query('SELECT id, name, profile_picture FROM users WHERE id = $1', [req.userId]);
  res.json(result.rows[0]);
});

module.exports = router;
