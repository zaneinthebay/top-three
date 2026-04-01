require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const db = require('./db/db');
const { sendDailyPromptNotification } = require('./notifications');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/prompts', require('./routes/prompts'));
app.use('/responses', require('./routes/responses'));
app.use('/friends', require('./routes/friends'));

// Health check
app.get('/health', (req, res) => res.json({ ok: true }));

// Cron: send push notification every day at 9am PT (4pm UTC)
cron.schedule('0 16 * * *', async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const result = await db.query(
      'SELECT * FROM prompts WHERE scheduled_date = $1',
      [today]
    );
    if (result.rows.length === 0) {
      console.log('No prompt scheduled for today');
      return;
    }
    const prompt = result.rows[0];
    await sendDailyPromptNotification(prompt);
    await db.query('UPDATE prompts SET sent_at = NOW() WHERE id = $1', [prompt.id]);
  } catch (err) {
    console.error('Cron error:', err);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Top Three API running on port ${PORT}`));
