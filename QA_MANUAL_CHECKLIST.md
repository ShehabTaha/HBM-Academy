# Manual QA Checklist

## UI/UX & Responsiveness

- [ ] **Mobile Breakdown**: Verify layout on mobile (375px) for all major pages.
  - [ ] Sidebar collapses/drawers work.
  - [ ] Tables scroll horizontally or stack.
- [ ] **Dark Mode**: Toggle theme and ensure no unreadable text or jarring contrasts.
- [ ] **Loading States**: Verify skeletons appear during data fetch (throttle network).
- [ ] **Empty States**: Verify tables/lists show "No results" when empty.

## Navigation & Accessibility

- [ ] **Keyboard Nav**: Can tab through all form inputs without trapping.
- [ ] **Focus States**: All interactive elements have visible focus rings.
- [ ] **Screen Reader**: Basic check with VoiceOver/NVDA on Dashboard.
- [ ] **Links**: No 404s on footer/sidebar links.

## Functional Smoke Tests

- [ ] **Auth**: Login, Logout, Session expiry handling.
- [ ] **Forms**: Validation errors appear for required fields.
- [ ] **Modals**: Close on ESC, close on backdrop click.
- [ ] **Toasts**: Success/Error messages appear after actions.

## Performance

- [ ] **Lighthouse**: Run audit on Dashboard. Score > 80?
- [ ] **Bundle Size**: Check for large unnecessary JS chunks.
- [ ] **Images**: Verify lazy loading behavior.
