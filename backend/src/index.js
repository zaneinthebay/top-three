require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');

const authRoutes = require('./routes/auth');
const promptRoutes = require('./routes/prompts');
const responseRoutes = require('./routes/responses');
const friendRoutes = require('./routes/friends');
const { sendDailyPromptNotification } = require('./notifications');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/prompts', promptRoutes);
app.use('/responses', responseRoutes);
app.use('/friends', friendRoutes);

app.get('/health', (req, res) => res.json({ ok: true }));

// Daily notification at 9:00 AM PT (= 16:00 UTC)
cron.schedule('0 16 * * *', () => {
  console.log('Sending daily prompt notifications...');
  sendDailyPromptNotification().catch(console.error);
}, { timezone: 'UTC' });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Top Three API running on port ${PORT}`));
