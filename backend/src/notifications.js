const { Expo } = require('expo-server-sdk');
const db = require('./db/db');

const expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });

async function sendDailyPromptNotification() {
  const today = new Date().toISOString().split('T')[0];

  // Get today's prompt
  const promptResult = await db.query(
    'SELECT * FROM prompts WHERE scheduled_date = $1',
    [today]
  );
  if (promptResult.rows.length === 0) {
    console.log('No prompt for today, skipping notifications');
    return;
  }

  const prompt = promptResult.rows[0];

  // Get all users with push tokens
  const usersResult = await db.query(
    'SELECT id, expo_push_token FROM users WHERE expo_push_token IS NOT NULL'
  );

  const messages = [];
  for (const user of usersResult.rows) {
    if (!Expo.isExpoPushToken(user.expo_push_token)) continue;
    messages.push({
      to: user.expo_push_token,
      sound: 'default',
      title: 'Top Three ✨',
      body: prompt.full_text,
      data: { promptId: prompt.id, screen: 'Rank' },
    });
  }

  // Send in chunks
  const chunks = expo.chunkPushNotifications(messages);
  for (const chunk of chunks) {
    try {
      await expo.sendPushNotificationsAsync(chunk);
    } catch (err) {
      console.error('Push notification error:', err);
    }
  }

  // Mark prompt as sent
  await db.query('UPDATE prompts SET sent_at = NOW() WHERE id = $1', [prompt.id]);
  console.log(`Sent daily prompt to ${messages.length} users: "${prompt.full_text}"`);
}

module.exports = { sendDailyPromptNotification };
