const { Expo } = require('expo-server-sdk');
const db = require('./db/db');

const expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });

async function sendDailyPromptNotification(prompt) {
  // Get all users with push tokens
  const result = await db.query(
    'SELECT id, expo_push_token FROM users WHERE expo_push_token IS NOT NULL'
  );

  const messages = [];
  for (const user of result.rows) {
    if (!Expo.isExpoPushToken(user.expo_push_token)) continue;

    messages.push({
      to: user.expo_push_token,
      sound: 'default',
      title: 'Top Three ✨',
      body: `${prompt.emoji || '🏆'} ${prompt.full_text}`,
      data: { promptId: prompt.id, type: 'daily_prompt' },
    });
  }

  if (messages.length === 0) return;

  const chunks = expo.chunkPushNotifications(messages);
  for (const chunk of chunks) {
    try {
      await expo.sendPushNotificationsAsync(chunk);
    } catch (err) {
      console.error('Push notification error:', err);
    }
  }

  console.log(`Sent daily prompt notification to ${messages.length} users`);
}

module.exports = { sendDailyPromptNotification };
