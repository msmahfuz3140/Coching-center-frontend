# TODO

- [ ] Implement Course Access modal UI in `src/app/admin/users/page.tsx`
  - [ ] Add state + modal open/close logic
  - [ ] Fetch courses + approvedCourseIds for selected user
  - [ ] Render checkbox list of all courses
  - [ ] Pre-check already approved courses
  - [ ] Save selection via PATCH `/api/admin/users/course-access`
  - [ ] Update UI + toast on success/failure
