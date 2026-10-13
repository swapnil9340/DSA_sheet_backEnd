# MongoDB Data Model

## Collections

### `users`
- `_id`: MongoDB ObjectId
- `name`: required, 2–80 chars
- `email`: required, lowercase + trimmed + unique
- `passwordHash`: bcrypt hash, excluded from default query results
- `role`: `student|admin` (public registration always creates `student`)
- `isActive`, `lastLoginAt`, `createdAt`, `updatedAt`
- Indexes: unique `email`; `isActive`

### `topics`
- `_id`, `slug` (unique), `name`, `description`, `order`, optional `parentTopicId`, `isActive`, timestamps
- Indexes: unique `slug`; `{order:1,name:1}`; `isActive`

### `problems`
- `_id`, `slug` (unique; also matches existing frontend problem IDs), `number` (unique), `title`, `topicId` reference, `difficulty`, `pattern`, `summary`, `estimatedMinutes`, `resources.practiceUrl`, `resources.youtubeUrl`, `resources.articleUrl`, `isActive`, `sourceTag`, timestamps
- Indexes: unique `slug`; unique `number`; `{topicId:1,difficulty:1,number:1}`; `{title:1,pattern:1}`

### `userprogress`
- `_id`, `userId` reference, `problemId` reference, `status` (`not_started|in_progress|completed`), `completedAt`, `attempts`, `notes`, timestamps
- Indexes: unique compound `{userId:1,problemId:1}`; `{userId:1,status:1,completedAt:-1}`
- Each student's status belongs to that student; progress is never written onto the global problem record.

### `studyplans`
- `_id`, `userId` reference, `title`, `topic`, `scheduledDate` (`YYYY-MM-DD` date-only string), `time` (`HH:mm`), `durationMinutes`, `notes`, `status` (`planned|completed|cancelled`), timestamps
- Indexes: `{userId:1,scheduledDate:1,time:1}`
- CRUD is restricted to the owning user. Date-only strings prevent timezone shifts when selecting calendar days.

## Relationships

- `topics 1 ── many problems` via `problems.topicId`.
- `users many ── many problems` through `userprogress`; unique on `{userId,problemId}`.
- `users 1 ── many studyplans` via `studyplans.userId`.

