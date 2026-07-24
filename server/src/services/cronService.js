const cron = require('node-cron');
const User = require('../models/User');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const { sendDailyMorningDigest } = require('./emailService');

const triggerMorningDigestsNow = async (specificUserId = null, targetHourStr = null) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    let users = [];
    if (specificUserId) {
      const user = await User.findById(specificUserId);
      if (user) users = [user];
    } else {
      let query = { 'preferences.dailyDigestEmail': { $ne: false } };
      if (targetHourStr) {
        query.$or = [
          { 'preferences.dailyDigestTime': targetHourStr },
          { 'preferences.dailyDigestTime': { $exists: false } }
        ];
      }
      users = await User.find(query);
    }

    let sentCount = 0;
    let lastError = null;

    for (const user of users) {
      if (!user.email) continue;

      // Find user's tasks scheduled for today or active uncompleted tasks
      const startOfDay = new Date(`${todayStr}T00:00:00`);
      const endOfDay = new Date(`${todayStr}T23:59:59`);

      const tasks = await Task.find({
        user: user._id,
        completed: false,
        $or: [
          { date: todayStr },
          { dueDate: { $gte: startOfDay, $lte: endOfDay } },
          { isRecurring: true },
          { date: { $exists: false } }
        ]
      }).limit(15);

        let lastError = null;
        try {
          await sendDailyMorningDigest({
            to: user.email,
            userName: user.name,
            tasks,
            dateStr: now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
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
          lastError = err;
        }

        if (specificUserId && sentCount === 0 && lastError) {
          throw lastError;
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
