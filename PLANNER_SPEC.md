# My Little Planner — Complete V1 Product Specification

## 1. Product Overview

My Little Planner is a cozy, personal, multi-user productivity and life-planning web application.

It combines:

- Daily planning
- Task management
- Top 3 daily priorities
- Daily timeline
- Brain Dump
- Calendar
- Events
- Habit tracking
- Notes
- Goals and milestones
- Mood tracking
- Daily notes
- Focus/Pomodoro mode
- Daily reflections
- Themes and personalization
- PWA support

The application must work across multiple devices.

Users must be able to create an account on one device and log into the same account on another device to access the same planner data.

All important user data must persist in MongoDB.

The application should feel like a personal digital planner rather than a corporate project-management dashboard.

---

# 2. Technology Stack

## Frontend

Use:

- React
- Vite
- Tailwind CSS
- React Router
- Axios
- TanStack Query
- Lucide React
- Framer Motion

Use TanStack Query for server state.

Use React Context only for appropriate global client state such as:

- Authentication
- Theme
- Global UI preferences where necessary

Do not use Redux unless there is a strong technical reason.

## Backend

Use:

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT
- bcrypt or bcryptjs
- cookie-parser
- cors
- dotenv
- helmet
- express-rate-limit
- Zod or equivalent validation

## Deployment

Frontend:

- Vercel

Backend:

- Render or Railway

Database:

- MongoDB Atlas

---

# 3. Project Structure

Use a maintainable monorepo-style structure.

Example:

myplanner/
├── client/
├── server/
├── package.json
├── .gitignore
├── PLANNER_SPEC.md
└── README.md

Frontend structure should include appropriate folders for:

- api
- assets
- components
- common components
- layout components
- pages
- hooks
- context
- styles
- utilities

Backend structure should include appropriate folders for:

- config
- controllers
- middleware
- models
- routes
- services
- validators
- utilities

Keep components reasonably sized.

Avoid giant page components where reusable functionality can be extracted.

---

# 4. Authentication

Implement secure multi-user authentication.

Required functionality:

- Register
- Login
- Logout
- Get current authenticated user
- Persistent authentication
- Protected frontend routes
- Protected backend routes

Use JWT authentication stored in HttpOnly cookies.

Do not store authentication JWTs in LocalStorage.

Passwords must be securely hashed.

The application should restore the authenticated user's session when the app reloads.

---

# 5. Authentication Security

Configure cookies correctly.

Development should work on localhost.

Production must support separate HTTPS frontend and backend domains.

Use appropriate:

- HttpOnly
- Secure
- SameSite

Configure CORS with credentials.

Every user-owned backend resource must be scoped using the authenticated user.

Use:

req.user._id

Never trust a user ID sent by the frontend as proof of resource ownership.

User A must never be able to:

- Read User B's resources
- Update User B's resources
- Delete User B's resources

Implement:

- Request validation
- Centralized error handling
- Appropriate rate limiting
- Secure HTTP headers

---

# 6. Authentication Pages

Create polished responsive pages for:

- Login
- Register
- Forgot Password
- Reset Password

Forgot Password and Reset Password must have complete frontend architecture.

If actual email delivery requires external provider credentials, isolate that integration cleanly and document the required environment variables.

Do not pretend an email was sent if no real email provider is configured.

---

# 7. Design Direction

The application should feel like a cozy personal digital planner.

Do not build a generic corporate SaaS dashboard.

Visual direction:

- Lavender
- Baby pink
- Cream
- Soft peach
- Sky blue
- Rounded cards
- Soft shadows
- Spacious layouts
- Gentle gradients
- Small decorative doodles
- Subtle animations

The application should feel:

- Cute
- Calm
- Cozy
- Personal
- Modern

It should not feel:

- Childish
- Overly cluttered
- Corporate
- Visually overwhelming

Use Lucide React icons consistently.

Use Framer Motion for subtle transitions and animations.

Animations must respect the user's animation on/off setting.

---

# 8. Reusable UI System

Create reusable components where appropriate for:

- Buttons
- Icon buttons
- Inputs
- Textareas
- Selects
- Checkboxes
- Cards
- Modals
- Dialogs
- Confirmation dialogs
- Page headers
- Empty states
- Loading states
- Error states
- Toast notifications
- Badges
- Progress bars

Maintain visual consistency throughout the application.

---

# 9. Application Layout

## Desktop

Create a responsive desktop layout with:

- Left sidebar
- Collapsible sidebar
- Main content area
- User/profile section
- Global Quick Add button

Sidebar navigation:

- Home
- Today
- Tasks
- Calendar
- Habits
- Notes
- Goals
- Brain Dump
- Focus
- Reflections
- Settings

Sidebar collapse preference may be stored locally as harmless UI state.

## Mobile

Create mobile bottom navigation containing:

- Home
- Today
- Tasks
- Calendar
- More

The More button must open a proper bottom sheet or menu containing:

- Habits
- Notes
- Goals
- Brain Dump
- Focus
- Reflections
- Settings

The mobile experience is equally important as desktop.

---

# 10. Home Dashboard

Create a personalized home dashboard.

Header should include:

- Time-based greeting
- User's name
- Today's date
- Motivational subtitle

Example greeting:

Good morning, Harshita 🌷

Let's make today a little better than yesterday.

Dashboard sections should include:

## Today's Tasks

Display today's tasks.

Show:

- Checkbox
- Task title
- Priority
- Time when available

Allow tasks to be completed/uncompleted directly from the dashboard.

## Today's Progress

Show:

- Number of completed tasks
- Total tasks
- Completion percentage

## Mood Tracker

Support:

- 😄 Amazing
- 🙂 Good
- 😐 Okay
- 😔 Low
- 😴 Tired

Store one mood per user per date.

Users should be able to update today's mood.

## Habit Snapshot

Show today's habits.

Display whether each habit is complete today.

## Upcoming Events

Show the nearest upcoming calendar events.

## Daily Note

Allow the user to save and edit today's note.

The application must not create duplicate daily notes every time the input loses focus or is saved repeatedly.

There should be one logical daily note per user per date.

---

# 11. Task Management

Implement complete task CRUD.

Task fields:

- Title
- Description
- Due date
- Due time
- Priority
- Category
- Completed
- CompletedAt
- Top 3 status
- Time block

Priorities:

- Low
- Medium
- High

Time blocks:

- Morning
- Afternoon
- Evening
- None

Task functionality:

- Create task
- View task
- Edit task
- Delete task
- Complete task
- Uncomplete task
- Search tasks
- Filter tasks
- Sort tasks

Primary task views:

- All
- Today
- Upcoming
- Completed

Additional filtering:

- Category
- Priority
- Completion state

Sorting:

- Due date
- Priority
- Recently created

Task filtering should be supported by user-scoped backend queries where appropriate.

---

# 12. Today Page

Create a dedicated Today planning page.

## Today's Top 3

Allow users to select up to three priority tasks for a specific day.

Maximum Top 3 count must be enforced by the backend.

Do not rely only on frontend validation.

Top 3 must be date-aware.

A user should not be able to mark more than three tasks as Top 3 for the same date.

## Daily Timeline

Create three sections:

- Morning
- Afternoon
- Evening

Show tasks assigned to each time block.

Allow users to:

- Create tasks from the timeline
- Edit timeline tasks
- Complete tasks

---

# 13. Brain Dump

Create a low-friction Brain Dump capture area.

Users should be able to:

- Create Brain Dump item
- Edit item
- Archive item
- Delete item

Allow conversion of a Brain Dump item into:

- Task
- Note
- Event

After conversion:

- Persist the converted resource
- Mark/archive the original Brain Dump item appropriately
- Invalidate relevant TanStack Query caches
- Show toast feedback

Conversion must not require the user to manually re-enter the original text.

---

# 14. Calendar

Build a real navigable monthly calendar.

Requirements:

- Correct number of days for each month
- Correct weekday offsets
- Previous month navigation
- Next month navigation
- Today button
- Selected date state
- Task indicators
- Event indicators

Selecting a date should show that day's:

- Tasks
- Events

The calendar must not be implemented as a fake fixed 35-day grid.

It must handle different months correctly.

The calendar should remain usable on mobile.

---

# 15. Events

Implement event CRUD.

Event fields:

- Title
- Description
- Date
- Start time
- End time
- Category

Users should be able to:

- Create event
- Edit event
- Delete event

Events should appear:

- On the Calendar
- In the selected-day panel
- In Upcoming Events where appropriate

---

# 16. Habit Tracker

Implement complete habit management.

Habit fields:

- Name
- Emoji/icon
- Description
- Active status

Users should be able to:

- Create habit
- Edit habit
- Delete habit

Track habit completion by date.

Create a weekly habit view with:

- Seven daily completion toggles
- Current streak
- Best streak
- Weekly completion percentage

Streaks must be calculated from persisted completion history.

Habit completion must be unique per:

- User
- Habit
- Date

Users must be able to toggle completion for specific days.

---

# 17. Notes

Implement complete note management.

Features:

- Create note
- Edit note
- Delete note
- Search notes
- Pin/unpin note
- Note color
- Note tag

Pinned notes should appear before unpinned notes.

Display notes using a responsive card grid.

Notes must persist in MongoDB.

---

# 18. Goals

Implement complete goal management.

Goal fields:

- Title
- Description
- Target date
- Status

Statuses:

- Not started
- In progress
- Completed
- Paused

Each goal may contain milestones.

Milestone functionality:

- Create milestone
- Edit milestone
- Delete milestone
- Complete milestone
- Uncomplete milestone

Calculate goal progress automatically from milestone completion.

Display a progress bar.

Users should be able to:

- Create goal
- Edit goal
- Delete goal

---

# 19. Focus Mode

Create a distraction-free Pomodoro-style Focus page.

Timer modes:

- 25-minute Focus
- 5-minute Short Break
- 15-minute Long Break

Controls:

- Start
- Pause
- Resume
- Reset

Allow the user to select an existing task to focus on.

Display the selected task during the focus session.

The Focus page should be responsive and visually calm.

---

# 20. Mood Tracking

Mood options:

- Amazing
- Good
- Okay
- Low
- Tired

Store:

- User
- Date
- Mood
- Optional note if appropriate

There should be one mood record per user per date.

Users should be able to update their mood for the current date.

---

# 21. Daily Reflections

Create date-based daily reflections.

Prompts:

- What went well?
- What could be better?
- What am I grateful for?

Include a day rating.

Users should be able to:

- Select/browse dates
- Create reflection
- Edit reflection
- Save/update reflection
- View reflection history

There must be one reflection per user per date.

---

# 22. Global Quick Add

Create a floating global Quick Add action.

Quick Add must support:

- Task
- Note
- Event

Do not implement a task-only Quick Add.

After creation:

- Invalidate appropriate TanStack Query caches
- Show success feedback through toast notifications

Quick Add should work on desktop and mobile.

---

# 23. Settings

Implement a complete Settings page.

Profile settings:

- Name
- Avatar field or avatar URL where appropriate

Preferences:

- Theme
- Week starts Sunday/Monday
- Animations on/off

Account:

- Logout

Server-backed preferences should persist across devices where appropriate.

Only harmless UI preferences should use LocalStorage.

---

# 24. Themes

Implement five complete themes:

1. Lavender
2. Pink
3. Blue
4. Peach
5. Dark

Use a maintainable theme architecture such as CSS variables.

Themes should affect the application consistently.

The animation toggle should disable or significantly reduce non-essential animations.

---

# 25. Database Models

At minimum implement:

- User
- Task
- Habit
- HabitCompletion
- Note
- Goal
- Event
- Mood
- Reflection
- BrainDumpItem

Use appropriate:

- User references
- Validation
- Indexes
- Unique constraints
- Timestamps

Every planner resource must belong to a user.

Important uniqueness constraints should include:

- One HabitCompletion per user/habit/date
- One Mood per user/date
- One Reflection per user/date
- One logical Daily Note per user/date

---

# 26. Backend Architecture

Use REST APIs.

Use appropriate separation between:

- Routes
- Controllers
- Models
- Middleware
- Validation
- Services/business logic
- Utilities

Do not place complex business logic directly inside route files.

Implement centralized backend error handling.

Use authentication middleware for protected routes.

Validate incoming data.

All user-owned database operations must be user-scoped.

---

# 27. Frontend API Architecture

Create a centralized Axios instance.

Configure:

- API base URL from environment variable
- withCredentials: true

Do not scatter random Axios calls directly throughout page components.

Create organized API modules.

Use TanStack Query for server state.

Use correct query keys and cache invalidation.

---

# 28. TanStack Query Requirements

Use TanStack Query for:

- Current user
- Tasks
- Habits
- Habit completions
- Notes
- Goals
- Events
- Brain Dump
- Mood
- Reflections

After mutations, invalidate only appropriate related queries where practical.

Provide:

- Loading states
- Error states
- Empty states

Avoid unnecessary refetching.

---

# 29. PWA

Configure My Little Planner as an installable Progressive Web App.

Include:

- Web app manifest
- App icons
- Theme color
- Background color
- Standalone display mode
- Service worker/offline application shell where practical

The application should be installable on supported:

- Mobile browsers
- Desktop browsers

---

# 30. Responsive Design

The application must be responsive.

Ensure usability at approximately:

- 320px
- 375px
- 430px
- Tablet widths
- Desktop widths

There must be no accidental horizontal page scrolling.

Complex interfaces such as:

- Calendar
- Tasks
- Habit weekly tracker
- Goals

must remain usable on mobile.

---

# 31. Environment Variables

Never commit real secrets.

Create:

client/.env.example

server/.env.example

Frontend variables should include:

VITE_API_URL

Backend variables should include:

NODE_ENV
PORT
MONGODB_URI
JWT_SECRET
JWT_EXPIRES_IN
FRONTEND_URL

If real password reset email delivery is implemented, document additional required email-provider variables.

Never commit:

- Real MongoDB passwords
- Real JWT secrets
- Email-provider secrets

---

# 32. Production Deployment

Prepare the frontend for deployment to Vercel.

Prepare the backend for deployment to Render or Railway.

Use MongoDB Atlas for production data.

Document:

- Frontend root directory
- Frontend build command
- Frontend output directory
- Backend root directory
- Backend start command
- Environment variables
- Production CORS configuration
- Production cookie configuration

Production authentication must work when frontend and backend are hosted on separate HTTPS domains.

---

# 33. Required End-to-End User Flow

The completed application should support this flow:

Register
→ Login
→ Load current authenticated user
→ Open personalized dashboard
→ Create task
→ Edit task
→ Complete task
→ Delete task
→ Search/filter/sort tasks
→ Select Top 3 tasks
→ Use daily timeline
→ Add Brain Dump item
→ Edit Brain Dump item
→ Convert Brain Dump item
→ Create calendar event
→ Edit event
→ Delete event
→ Track mood
→ Create habit
→ Toggle habit completions
→ View current streak
→ View best streak
→ View weekly completion percentage
→ Create note
→ Edit note
→ Pin note
→ Search notes
→ Create goal
→ Create milestones
→ Complete milestones
→ View goal progress
→ Use Focus timer
→ Select focus task
→ Save daily reflection
→ Browse reflection history
→ Change theme
→ Change settings
→ Logout
→ Login again
→ Confirm persisted data is restored

The application must also ensure:

User A cannot access User B's resources.

---

# 34. Loading, Error, Empty and Success States

All major server-backed pages should handle:

- Initial loading
- Mutation loading
- API errors
- Empty data

Use friendly planner-themed empty states.

Examples:

Tasks:
"Nothing here yet. Your day is a blank page ✨"

Habits:
"Start with one tiny habit 🌱"

Notes:
"Your thoughts have plenty of room here ♡"

Use toast notifications for important successful and failed mutations.

---

# 35. Code Quality

Keep the codebase maintainable.

Requirements:

- Avoid giant components
- Extract reusable components
- Keep API logic organized
- Keep business logic testable
- Use consistent naming
- Use consistent API response structures
- Avoid duplicated logic
- Do not hardcode production URLs
- Do not hardcode secrets

Use stable package versions where practical.

---

# 36. Definition of Complete

The following do NOT count as completed implementations:

- Fixed fake calendar
- Task-only Quick Add
- Buttons without handlers
- UI that does not persist data
- Fake habit streak numbers
- Fake completion percentages
- Settings controls that do nothing
- Placeholder CRUD screens
- Fake password reset email delivery
- Cross-user-accessible resources
- Features represented only by headings or cards
- Code that cannot build because of code errors

A feature is considered complete when the required UI, API, persistence, validation, user scoping, state updates, and relevant loading/error behavior work together.

---

# 37. Implementation Order

Use this order internally:

1. Project foundation
2. Design system
3. Authentication
4. Application layout
5. Task management
6. Today page
7. Home dashboard
8. Brain Dump
9. Calendar and Events
10. Habit Tracker
11. Notes
12. Goals
13. Focus Mode
14. Daily Reflections
15. Settings and Themes
16. Global Quick Add
17. PWA
18. Mobile optimization
19. Security review
20. Production/deployment configuration
21. Testing and final verification

The implementation agent should continue through all phases without requiring approval between each phase.

---

# 38. Testing Requirements

Before considering the application complete:

- Install dependencies
- Run frontend production build
- Run backend syntax/lint checks
- Run available tests
- Run git diff --check

If a code-related check fails:

- Diagnose the error
- Fix it
- Run the check again

Do not claim the application is production-ready while the frontend production build is failing.

If an external environment restriction prevents a check from running, clearly report the exact restriction instead of claiming success.

---

# 39. Git Requirements

Development must happen on the designated feature branch.

Do not implement directly on main.

Before completion:

- Check git status
- Review intended changes
- Commit implementation
- Verify commit exists locally
- Verify GitHub origin
- Push feature branch to origin

Do not claim a successful push unless the actual git push command succeeds.

Do not claim a Pull Request exists unless there is a real GitHub PR URL.

---

# 40. Final Goal

The final result should be a polished, secure, responsive, multi-user personal planner that feels cozy and personal while providing practical productivity tools.

The V1 should be functional enough for real personal use across phone and desktop, with persistent cloud-backed data, secure authentication, responsive design, and deployment-ready configuration.