# Security Specification: AniPac Firestore Rules

## 1. Data Invariants
1. **User Profiles (`/users/{userId}`)**:
   - `userId` path variable must match `request.auth.uid`.
   - Only the authenticated user can create or update their own user profile.
   - Profile `userId` field must match `request.auth.uid`.
   - String sizes and numerical boundaries must be strictly constrained (displayName <= 50, highScore >= 0, maxLevelReached >= 1).
   - Anyone authenticated or unauthenticated can read public player profiles or top stats.

2. **Leaderboard (`/leaderboard/{entryId}`)**:
   - Any player (authenticated) can post a high score entry under their own UID (`incoming().userId == request.auth.uid`).
   - Score must be a positive integer <= 999,999,999; Level must be between 1 and 1001.
   - Leaderboard documents are immutable once created (no unauthorized score tampering) unless deleted/overwritten by the owner.
   - Leaderboard is publicly readable for global ranking.

3. **Ghost Replays (`/replays/{replayId}`)**:
   - Authenticated players can save their best run recordings under their own UID (`incoming().userId == request.auth.uid`).
   - `replayId` must be a valid ID matching `^[a-zA-Z0-9_\-]+$`.
   - `replayData` frame payload bounded to <= 500,000 characters.
   - Score, level, duration, and metadata strictly type-checked and bounded.
   - Replays are publicly readable so players can watch and study top run techniques.

## 2. The Dirty Dozen Payloads & Test Scenarios
1. Unauthenticated write to `/users/{userId}` -> DENIED
2. User A updating `/users/{userB}` -> DENIED
3. User setting `userId` in body different from `request.auth.uid` -> DENIED
4. Payload with 1MB displayName -> DENIED
5. User submitting leaderboard entry with negative score or NaN -> DENIED
6. User submitting leaderboard entry on level 99999 (exceeding max 1001) -> DENIED
7. User attempting to tamper with another player's leaderboard entry -> DENIED
8. Malicious payload injecting extra ghost fields (`isAdmin: true`, `backdoor: 1`) -> DENIED
9. Malicious document ID with illegal characters / path traversal -> DENIED
10. Unauthenticated deletion of leaderboard records -> DENIED
11. User altering immutable fields on update -> DENIED
12. Denial of wallet spam with payload exceeding max length bounds -> DENIED
