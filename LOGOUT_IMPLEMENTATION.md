# Logout Functionality Implementation

## Overview
This document describes the complete logout functionality implementation that follows the same pattern as the login functionality.

## Files Created/Modified

### Backend Files

#### 1. New Files Created
- `Backend/models/TokenBlacklist.js` - Token blacklist model for handling logout and token invalidation
- `Backend/routes/auth.js` - Authentication routes including login and logout endpoints

#### 2. Modified Files
- `Backend/models/schema.js` - Added `createTokenBlacklistTable()` function and updated `createAllTables()`
- `Backend/middleware/auth.js` - Updated `verifyToken` to check token blacklist
- `Backend/server.js` - Added import for `authRoutes` and updated route mappings
- `Backend/routes/users.js` - Removed login endpoint (moved to auth.js)

### Frontend Files

#### 1. Modified Files
- `src/context/AuthContext.tsx` - Updated `logout` function to call backend API
- `src/services/api.ts` - Already had logout endpoint defined

## Implementation Details

### Backend Implementation

#### Token Blacklist Model
The `TokenBlacklist` model handles:
- Adding tokens to blacklist on logout
- Checking if tokens are blacklisted during authentication
- Cleaning up expired tokens periodically

#### Auth Routes
- **POST /api/auth/login** - User authentication (moved from users.js)
- **POST /api/auth/logout** - User logout with token invalidation
- **POST /api/auth/cleanup-tokens** - Optional endpoint for cleaning expired tokens

#### Authentication Middleware
Updated to check token blacklist before verifying JWT signature, ensuring logged-out tokens cannot be used.

### Frontend Implementation

#### Auth Context
The `logout` function now:
1. Calls the backend logout endpoint with the current token
2. Handles API errors gracefully (continues with local logout)
3. Clears local storage and state
4. Redirects to login page

#### API Service
The `authApi.logout()` function was already defined and connects to the backend endpoint.

## Security Features

### Token Invalidation
- Tokens are added to a blacklist table on logout
- Blacklisted tokens are rejected by the authentication middleware
- Tokens automatically expire based on JWT expiration time

### Error Handling
- Backend logout failures don't prevent local logout
- Frontend gracefully handles network errors
- User is always redirected to login page after logout

## Testing

### Manual Testing Steps
1. Login with valid credentials
2. Click the "Sign Out" button in the sidebar
3. Verify redirection to login page
4. Attempt to use the old token (should be rejected)
5. Try to access protected routes (should redirect to login)

### API Testing
```bash
# Test logout endpoint
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_VALID_TOKEN"
```

## Database Schema

### token_blacklist Table
```sql
CREATE TABLE IF NOT EXISTS token_blacklist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token TEXT NOT NULL,
  user_id INT NOT NULL REFERENCES user(user_id),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_token (token(255)),
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at)
);
```

## Integration Points

### Existing Functionality
- ✅ Role-based protected routes
- ✅ Session storage for token management
- ✅ Automatic logout on token expiration (401 errors)
- ✅ Sidebar logout button
- ✅ Response interceptor for token management

### New Functionality
- ✅ Backend token invalidation
- ✅ Proper logout API endpoint
- ✅ Token blacklist mechanism
- ✅ Secure token revocation

## Deployment Notes

1. The database schema will be automatically updated on server restart
2. No migration scripts needed (uses `CREATE TABLE IF NOT EXISTS`)
3. Existing users and data remain unaffected
4. The implementation is backward compatible

## Future Enhancements

1. **Token Cleanup Job**: Implement periodic cleanup of expired tokens
2. **Session Management**: Add active session tracking
3. **Logout Everywhere**: Implement single sign-out across multiple sessions
4. **Token Refresh**: Add token refresh functionality
5. **Logout History**: Track user logout events for audit purposes