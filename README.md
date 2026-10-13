# DSA Sheet — Node.js Backend

This is **Phase 2 (Node/Express API)** for the fresh DSA Sheet application. It matches the agreed project decisions: React + JavaScript frontend, Node.js/Express API, MongoDB persistence, secure HttpOnly JWT cookie, 10 chapters and 50 curated starter problems, persistent per-user completion progress, a dedicated study calendar, optional Redis caching, and health checks suitable for an AWS Application Load Balancer.

> This source is prepared, but it is not a live deployment. MongoDB URI, JWT secret, optional Redis endpoint, and AWS resources must be configured in your environment. Never commit `.env` or production credentials.

## Requirements

- Node.js 20 or later
- npm
- MongoDB local or MongoDB Atlas
- Redis is optional during local development; public catalogue endpoints bypass the cache if `REDIS_URL` is empty

## Start locally

1. Open a terminal in this folder.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env` and configure at least:

   ```env
   NODE_ENV=development
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   MONGO_URI=mongodb://127.0.0.1:27017/dsa_sheet
   JWT_SECRET=replace-with-a-long-random-secret-at-least-32-characters
   ```

   Generate a secret with `openssl rand -base64 48` if OpenSSL is installed. Paste the result into `.env`; do not use the example secret for production.

4. Seed the 10 chapters and 50 starter problems:

   ```bash
   npm run seed
   ```

5. Start the API:

   ```bash
   npm run dev
   ```

6. Verify:

   - `GET http://localhost:5000/health`
   - `GET http://localhost:5000/api/v1/topics`
   - `GET http://localhost:5000/api/v1/problems`

The API uses `http://localhost:5000/api/v1` by default. The React dev server currently runs on `http://localhost:5173`.

## Redis configuration

Redis is optional. With `REDIS_URL` omitted, API requests query MongoDB directly. To enable local Redis, set `REDIS_URL=redis://127.0.0.1:6379`. The current code caches **public catalogue data only** (topics and problem listings/details); user progress and calendar data are always read/written through MongoDB.

For a horizontally scaled deployment, all API instances must point to the **same shared Redis endpoint**. Running one isolated Redis process on each EC2 instance does not provide a shared cache. Redis outage should not prevent the API from running; it logs the problem and bypasses cache.

## Authentication and frontend integration

- Successful register/login responses set an `HttpOnly` cookie named `dsa_access_token` by default.
- Browser `fetch` calls must use `credentials: 'include'`.
- The default CORS origin is `http://localhost:5173`; change `FRONTEND_URL` to the exact frontend origin or comma-separated allowed origins.
- Passwords are hashed with bcrypt; raw passwords are never stored.
- The backend enforces a minimum password length of 8 characters. Align the existing frontend form's current 6-character helper text/validation to 8 during API integration.
- Prefer serving React and `/api` from the same site behind Nginx/ALB. Do not switch to cross-site `SameSite=None` cookies without HTTPS and a deliberate CSRF strategy.

## Data seed and resource quality

The seed script upserts **10 topics and 50 problems** and prints the difficulty counts. Expected distribution: **18 Easy, 22 Medium, 10 Hard**. LeetCode practice links are problem-specific starter links; YouTube and GeeksforGeeks URLs are currently search links, not manually verified direct tutorials/articles. Verify all three resources for every problem before production.

## Useful commands

```bash
npm run dev       # local API with file watch
npm start         # production-style start
npm run seed      # idempotently seed catalogue data
npm test          # API smoke tests
npm run check     # quick Node syntax check
```

## AWS / horizontal scaling notes

- `/health` returns HTTP 200 and can be used for ALB target health checks.
- Use a Launch Template + Auto Scaling Group to launch multiple identical EC2 instances; an ALB forwards traffic to healthy instances.
- Configure the same `MONGO_URI`, `JWT_SECRET`, cookie/domain settings, and shared `REDIS_URL` through SSM Parameter Store/Secrets Manager or a secure deployment mechanism; do not bake secrets into the AMI or GitHub repository.
- If the API runs behind ALB, set `TRUST_PROXY=true` only when it is truly behind the trusted proxy, use HTTPS, and limit security-group ingress so the API instances receive traffic only from the ALB security group.
- `MONGO_MAX_POOL_SIZE` is **per API process**, so total possible DB connections grow with the number of EC2 instances. Tune connection pools and MongoDB capacity with load tests; do not assume 50,000 concurrent users have been proven by this scaffold.
- ALB, EC2 instances, Redis/ElastiCache, data transfer and other AWS components can incur charges. The source code itself does not provision resources.

See `docs/API.md`, `docs/DATABASE.md`, and `docs/SECURITY_AND_DEPLOYMENT.md` for details.
