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
        const hourConditions = [{ 'preferences.dailyDigestTime': targetHourStr }];
        if (targetHourStr === '08:00') {
          hourConditions.push({ 'preferences.dailyDigestTime': { $exists: false } });
          hourConditions.push({ 'preferences.dailyDigestTime': null });
          hourConditions.push({ 'preferences.dailyDigestTime': '' });
        }
        query.$or = hourConditions;
      }
      users = await User.find(query);
    }

    let sentCount = 0;
    let lastError = null;

    for (const user of users) {
      if (!user.email) continue;

      const targetDateEnd = new Date(`${todayStr}T23:59:59.999Z`);
      const rawTasks = await Task.find({
        user: user._id,
        $or: [
          { dueDate: todayStr },
          { dueDate: '' },
          { dueDate: null },
          { dueDate: { $exists: false } },
          {
            isRecurringDaily: true,
            $or: [
              { dueDate: { $lte: todayStr } },
              { completedDates: todayStr },
              { createdAt: { $lte: targetDateEnd } },
              { dueDate: '' },
              { dueDate: { $exists: false } }
            ]
          }
        ]
      }).limit(100);

      let tasks = rawTasks
        .filter((t) => {
          if (t.isRecurringDaily && Array.isArray(t.excludedDates) && t.excludedDates.includes(todayStr)) {
            return false;
          }
          return true;
        })
        .map((t) => {
          const obj = t.toObject ? t.toObject() : { ...t };
          if (obj.isRecurringDaily) {
            obj.completed = Array.isArray(obj.completedDates) && obj.completedDates.includes(todayStr);
            obj.dueDate = todayStr;
          }
          return obj;
        });

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
