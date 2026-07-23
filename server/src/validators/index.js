const { z } = require('zod');

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters')
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(1, 'Password is required')
  })
});

const taskSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Task title is required'),
    description: z.string().optional(),
    dueDate: z.string().optional(),
    dueTime: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    category: z.string().optional(),
    completed: z.boolean().optional(),
    isTop3: z.boolean().optional(),
    top3Date: z.string().optional(),
    timeBlock: z.enum(['morning', 'afternoon', 'evening', 'night', 'none']).optional(),
    isRecurringDaily: z.boolean().optional()
  })
});

const habitSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Habit name is required'),
    emoji: z.string().optional(),
    description: z.string().optional(),
    active: z.boolean().optional()
  })
});

const noteSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    content: z.string().optional(),
    isPinned: z.boolean().optional(),
    color: z.string().optional(),
    tags: z.array(z.string()).optional()
  })
});

const goalSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Goal title is required'),
    description: z.string().optional(),
    targetDate: z.string().optional(),
    status: z.enum(['not_started', 'in_progress', 'completed', 'paused']).optional()
  })
});

const eventSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Event title is required'),
    description: z.string().optional(),
    date: z.string().min(1, 'Event date is required'),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    category: z.string().optional()
  })
});

const moodSchema = z.object({
  body: z.object({
    date: z.string().min(1, 'Date is required'),
    mood: z.enum(['amazing', 'good', 'okay', 'low', 'tired']),
    note: z.string().optional()
  })
});

const reflectionSchema = z.object({
  body: z.object({
    date: z.string().min(1, 'Date is required'),
    whatWentWell: z.string().optional(),
    whatCouldBeBetter: z.string().optional(),
    gratitude: z.string().optional(),
    rating: z.number().min(1).max(5).optional()
  })
});

const brainDumpSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Content is required'),
    category: z.string().optional()
  })
});

const dailyNoteSchema = z.object({
  body: z.object({
    date: z.string().min(1, 'Date is required'),
    content: z.string()
  })
});

module.exports = {
  registerSchema,
  loginSchema,
  taskSchema,
  habitSchema,
  noteSchema,
  goalSchema,
  eventSchema,
  moodSchema,
  reflectionSchema,
  brainDumpSchema,
  dailyNoteSchema
};
