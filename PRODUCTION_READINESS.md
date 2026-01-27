# Production Readiness Checklist

## Security

- [ ] **HTTPS**: Ensure SSL certs are valid and forced.
- [ ] **Headers**:
  - [ ] `X-Content-Type-Options: nosniff`
  - [ ] `X-Frame-Options: DENY` (or SAMEORIGIN)
  - [ ] `Strict-Transport-Security`
- [ ] **Authentication**:
  - [ ] NextAuth secret is set and high entropy.
  - [ ] Token expiration policies are set appropriately.
  - [ ] Middleware handles all protected routes correctly.
- [ ] **Environment**:
  - [ ] No secrets exposed in `NEXT_PUBLIC_` variables.
  - [ ] Database service role key is NOT in client bundle.

## Performance

- [ ] **Images**: All images use `next/image` with proper sizing/AVIF.
- [ ] **Code Splitting**: Verify initial bundle size is < 200KB (gzip).
- [ ] **Caching**:
  - [ ] Static pages generated where possible or using ISR.
  - [ ] API responses cached where appropriate.
- [ ] **Database**:
  - [ ] Indexes exist for all foreign keys and frequently queried columns.
  - [ ] RLS policies enable efficient access patterns (no full table scans).

## Reliability & Error Handling

- [ ] **Error Boundaries**: App has global `error.tsx` and `not-found.tsx`.
- [ ] **Logging**: Structured logging (Sentry/LogRocket) connected.
- [ ] **Fallbacks**: UI has loading skeletons and empty states.

## Testing

- [ ] **Unit**: Critical utilities tested.
- [ ] **E2E**: All Core User Flows (Auth, Dashboard, students) automated.
- [ ] **Manual**: Dark mode and responsive check completed.

## Deployment

- [ ] **Env Validation**: App crashes on startup if critical vars missing.
- [ ] **Build**: `npm run build` passes with no lint/type errors.
