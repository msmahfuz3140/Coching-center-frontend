# TODO - Course access locking

## Step 1: Secure backend course details

- Edit `src/app/api/courses/[slug]/route.ts`
- If user is not ADMIN:
  - Look up enrollment for this course (by courseId)
  - If no APPROVED enrollment:
    - Return course info + syllabus metadata
    - Remove/empty `videos` so youtube URLs/details are not leaked

## Step 2: Update course details UI

- Edit `src/app/courses/[slug]/page.tsx`
- Show enrollment state (PENDING/REJECTED) and appropriate button text
- If no approved access, keep sidebar showing locked modules (titles only) and ensure VideoPlayer shows locked overlay

## Step 3 (optional): Improve courses list badges

- Edit `src/app/courses/page.tsx`
- Show badges based on whether user has APPROVED/PENDING enrollment per course

## Step 4: Run & test

- `npm run dev`
- Verify:
  - User without approval cannot get `videos` payload
  - User sees locked UI and can request enroll
  - After admin approval, user can watch
