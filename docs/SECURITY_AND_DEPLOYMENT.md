# Security and Deployment Notes

## Security implemented in this backend

- Password hashing via bcrypt (12 rounds).
- JWT in `HttpOnly` cookie; bearer token is also accepted for API clients.
- Cookie flags: `HttpOnly`, `SameSite` configurable (default `Lax`), and `Secure` in production or when `SameSite=None`.
- Auth route rate limiting, Helmet headers, exact-origin credentialed CORS, JSON body limits, Zod input validation, parameterized Mongoose queries and escaped search regexes.
- Progress, dashboard, calendar and profile endpoints require authentication; calendar CRUD queries include the current `userId` to prevent cross-user access.
- Error responses avoid exposing server exception details in production.

## Before production

1. Use HTTPS and a real domain; prefer serving API + React from one site.
2. Set a random `JWT_SECRET` of at least 32 characters in AWS SSM Parameter Store or Secrets Manager.
3. Restrict CORS to the exact UI origin. If cross-site cookies are required, configure HTTPS + `SameSite=None` and add a CSRF protection plan.
4. Lock EC2 security group inbound app port to the ALB security group, not to the whole Internet. Let ALB accept HTTPS from users.
5. Use private subnets for app instances and database/cache where architecture permits; don't expose MongoDB or Redis publicly.
6. Enable MongoDB authentication, network access restrictions, backups and alerts. Keep the URI private.
7. Put shared configuration/secrets outside the AMI. Deploy the same immutable application artifact to all EC2 instances.
8. Add GitHub Actions steps for install, lint/test/build, package, deploy to staging, health check, and controlled production promotion/rollback.
9. Use `/health` for ALB target health checks. Decide if liveness should remain independent of dependencies; this endpoint currently checks API process health only.
10. Configure CloudWatch logs, metrics, alarms and a tested rollback.
11. Load test realistic login, list problems, progress toggle, and calendar workflows. Monitor p95/p99 response time, error rate, event-loop/CPU, memory, Redis latency, MongoDB utilization and connection count.

## Scale-out notes

- Auto Scaling Group + Launch Template creates multiple equivalent stateless API instances; ALB distributes traffic.
- User state is in signed cookies, while authoritative user/progress/calendar data is in MongoDB. Do not use per-instance memory for sessions or progress.
- Optional Redis cache is for public static catalogue reads. A shared Redis endpoint must be configured across instances for consistent cache behavior.
- Tune MongoDB pool sizes against expected instance count: total possible connections are approximately `instance count × Node process count × maxPoolSize`.
- 50,000 concurrent users is a design target, not a measured capacity claim. It requires load tests and iterative capacity tuning.
