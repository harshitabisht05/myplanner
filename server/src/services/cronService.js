const cron = require('node-cron');
const User = require('../models/User');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const { sendDailyMorningDigest } = require('./emailService');

const triggerMorningDigestsNow = async (specificUserId = null) => {
  try {
    const todayDate = new Date();
    const todayStr = todayDate.toISOString().split('T')[0];

    const query = specificUserId
      ? { _id: specificUserId }
      : { 'preferences.dailyDigestEmail': { $ne: false } };

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
  // Schedule daily morning digest at 8:00 AM every day
  cron.schedule('0 8 * * *', async () => {
    console.log('🌅 Running daily morning email digest cron job at 8:00 AM...');
    await triggerMorningDigestsNow();
  });

  console.log('⏰ Cron service initialized (Daily Morning Digest scheduled at 8:00 AM)');
};

module.exports = {
  startCronJobs,
  triggerMorningDigestsNow
};
