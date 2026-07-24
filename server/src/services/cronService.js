const cron = require('node-cron');
const User = require('../models/User');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const { sendDailyMorningDigest } = require('./emailService');

const triggerMorningDigestsNow = async (specificUserId = null, targetHourStr = null) => {
  try {
    const todayDate = new Date();
    const todayStr = todayDate.toISOString().split('T')[0];

    let query = { 'preferences.dailyDigestEmail': { $ne: false } };

    if (specificUserId) {
      query._id = specificUserId;
    } else if (targetHourStr) {
      query.$or = [
        { 'preferences.dailyDigestTime': targetHourStr },
        { 'preferences.dailyDigestTime': { $exists: false } } // fallback default 08:00
      ];
    }

    const users = await User.find(query);
    let sentCount = 0;

    for (const user of users) {
      if (!user.email) continue;

      // Find user's scheduled tasks for today
      const tasks = await Task.find({
        user: user._id,
        $or: [
          { date: todayStr },
          { dueDate: { $gte: new Date(todayStr), $lt: new Date(Date.now() + 86400000) } },
          { isRecurring: true }
        ],
        completed: false
      }).limit(10);

      try {
        await sendDailyMorningDigest({
          to: user.email,
          userName: user.name,
          tasks,
          dateStr: todayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
        });

        // Record in-app notification
        await Notification.create({
          user: user._id,
          title: 'Morning Digest Email Delivered 🌅',
          message: `Your daily plan with ${tasks.length} task(s) was sent to ${user.email}. Have a productive day!`,
          type: 'digest',
          link: '/today'
        });

        sentCount++;
      } catch (err) {
        console.error(`Failed to send morning digest for user ${user.email}:`, err.message);
      }
    }

    return { success: true, count: sentCount };
  } catch (error) {
    console.error('Error running morning digest routine:', error.message);
    throw error;
  }
};

const startCronJobs = () => {
  // Check hourly at top of hour for matching user custom daily digest times
  cron.schedule('0 * * * *', async () => {
    const currentHourNum = new Date().getHours();
    const currentHourStr = `${String(currentHourNum).padStart(2, '0')}:00`;
    console.log(`🌅 Hourly digest cron checking user preferences for ${currentHourStr}...`);
    await triggerMorningDigestsNow(null, currentHourStr);
  });

  console.log('⏰ Dynamic Cron service initialized (Checks user custom digest times hourly)');
};

module.exports = {
  startCronJobs,
  triggerMorningDigestsNow
};
