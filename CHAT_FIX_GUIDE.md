# Chat User Search Fix Guide

## Problem
When clicking the "+" button in the chat sidebar to search for users, no users appear even though there are accounts in the database.

## Root Cause Analysis

### Backend (✅ Working)
The backend API is functioning correctly:
- `/api/chat/users` endpoint returns users properly
- Database has 2 active users (admin and malek)
- Query filters work correctly (excludes current user, filters by isActive: true)
- Tested with `backend/scripts/test-chat-api.js` - confirmed working

### Frontend (❌ Issue Found)
The issue was in `frontend/components/chat-widget.tsx`:

1. **useEffect Dependency Issue** (Lines 290-298 and 300-312)
   - `fetchPickerUsers` was included in the dependency array
   - This caused infinite re-renders because the function is recreated on every render
   - **Fixed**: Removed `fetchPickerUsers` from dependencies and added eslint-disable comment

2. **Missing Error Logging**
   - No console logs to debug API failures
   - **Fixed**: Added comprehensive logging to `apiFetch` and `fetchPickerUsers`

## Changes Made

### 1. Fixed useEffect Dependencies
```typescript
// Before (caused infinite loop)
}, [fetchPickerUsers, isAuthenticated, isOpen, isUserPickerOpen]);

// After (fixed)
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [isAuthenticated, isOpen, isUserPickerOpen]);
```

### 2. Added Debug Logging
- Added logs in `apiFetch` to show:
  - Request path
  - Token presence
  - Response status and data
- Added logs in `fetchPickerUsers` to show:
  - Query parameters
  - API response
  - Errors

## Testing Steps

### 1. Check Backend (Already Verified ✅)
```bash
cd backend
node scripts/check-users.js
node scripts/test-chat-api.js
```

### 2. Test Frontend
1. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Open browser console (F12)

4. Login with one of these accounts:
   - Admin: admin@eduhub.com / azerty01
   - User: malek@gmail.com / (check users.txt for password)

5. Click the chat icon (bottom left)

6. Click the "+" button

7. Check console logs:
   - Should see: `[ChatWidget] Fetching picker users`
   - Should see: `[ChatWidget] API Fetch: /api/chat/users?page=1&limit=20&q=`
   - Should see: `[ChatWidget] API Response` with users array
   - Should see: `[ChatWidget] Picker users response` with data

### Expected Console Output
```
[ChatWidget] Fetching picker users: { q: '', nextPage: 1, reset: true }
[ChatWidget] API Fetch: { path: '/api/chat/users?page=1&limit=20&q=', hasToken: true }
[ChatWidget] API Response: { path: '/api/chat/users?page=1&limit=20&q=', status: 200, ok: true, data: { users: [...], pagination: {...} } }
[ChatWidget] Picker users response: { users: [...], pagination: {...} }
```

## Possible Issues & Solutions

### Issue 1: "Not authorized, no token"
**Cause**: User is not logged in or token expired
**Solution**: 
- Check localStorage for 'authToken'
- Re-login to get a fresh token

### Issue 2: "Not authorized, user not found"
**Cause**: Token is valid but user was deleted from database
**Solution**: Re-login with valid credentials

### Issue 3: Empty users array but status 200
**Cause**: All users are inactive or only one user exists (the current user)
**Solution**: 
- Create more test users
- Ensure users have `isActive: true`

### Issue 4: CORS error
**Cause**: Frontend URL not in CORS whitelist
**Solution**: 
- Check `backend/.env` has `FRONTEND_URL=http://localhost:3000`
- Restart backend server

### Issue 5: Network error / Connection refused
**Cause**: Backend server not running
**Solution**: 
- Start backend: `cd backend && npm start`
- Verify it's running on port 5000

## Database Verification

Current users in database:
```
1. Super Admin
   Email: admin@eduhub.com
   Role: admin
   isActive: true
   ID: 6984db1152a8d502a3bc733d

2. malek
   Email: malek@gmail.com
   Role: user
   isActive: true
   ID: 6984db96cfa81a5daf40fac1
```

When logged in as admin, you should see "malek" in the user picker.
When logged in as malek, you should see "Super Admin" in the user picker.

## Next Steps

1. Test the fix by following the testing steps above
2. Check browser console for the debug logs
3. If users still don't appear, share the console logs for further debugging
4. Once confirmed working, you can remove the debug console.log statements

## Additional Notes

- The chat widget only shows users where `isActive: true`
- The current user is always excluded from the list
- Search is case-insensitive and searches name, username, and email
- Pagination is supported (20 users per page)
