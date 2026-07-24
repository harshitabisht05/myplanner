const cron = require('node-cron');
const User = require('../models/User');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const { sendDailyMorningDigest } = require('./emailService');

const triggerMorningDigestsNow = async (specificUserId = null, targetHourStr = null, clientDateStr = null) => {
  try {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    let todayStr = '';
    let formattedDateStr = '';

    if (clientDateStr && /^\d{4}-\d{2}-\d{2}$/.test(clientDateStr)) {
      todayStr = clientDateStr;
      const [y, m, d] = clientDateStr.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      formattedDateStr = `${days[dateObj.getDay()]}, ${months[dateObj.getMonth()]} ${dateObj.getDate()}`;
    } else {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      todayStr = `${year}-${month}-${day}`;
      formattedDateStr = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;
    }

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

      // Query uncompleted tasks scheduled for today or active pending tasks
      let tasks = await Task.find({
        user: user._id,
        completed: false,
        $or: [
          { dueDate: todayStr },
          { dueDate: '' },
          { dueDate: null },
          { dueDate: { $exists: false } },
          { isRecurringDaily: true }
        ]
      }).limit(20);

      // Fallback: If no tasks found matching today's filter, fetch user's top pending uncompleted tasks
      if (tasks.length === 0) {
        tasks = await Task.find({
          user: user._id,
          completed: false
        }).sort({ createdAt: -1 }).limit(15);
      }

        let lastError = null;
        try {
          await sendDailyMorningDigest({
            to: user.email,
            userName: user.name,
            tasks,
            dateStr: formattedDateStr
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
