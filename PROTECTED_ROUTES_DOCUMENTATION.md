# Role-Based Protected Route Wrappers

This document describes the implementation of role-based protected wrappers for admin, manager, and worker routes.

## Files Created

### 1. Protected Wrapper Components
- `src/components/wrappers/AdminProtectedWrapper.tsx`
- `src/components/wrappers/ManagerProtectedWrapper.tsx`
- `src/components/wrappers/WorkerProtectedWrapper.tsx`
- `src/components/wrappers/index.ts` (export index)

### 2. Updated Files
- `src/App.tsx` - Integrated protected wrappers into route definitions

## Features

### Authentication Protection
- ✅ Prevents unauthorized access to role-specific routes
- ✅ Redirects unauthenticated users to login page
- ✅ Shows loading state during authentication check
- ✅ Preserves attempted route in location state

### Role-Based Access Control
- **Admin Protected Wrapper**: Only allows users with `admin` role
- **Manager Protected Wrapper**: Only allows users with `manager` role
- **Worker Protected Wrapper**: Only allows users with `worker` role

### Redirect Logic
- If user is not authenticated → Redirect to `/login`
- If user has wrong role → Redirect to their appropriate dashboard
- If user is authorized → Render the protected content

## Implementation Details

### Wrapper Structure
```tsx
interface ProtectedWrapperProps {
  children: React.ReactNode;
}

export default function RoleProtectedWrapper({ children }: ProtectedWrapperProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Loading state
  if (isLoading) {
    return <LoadingComponent />;
  }

  // Authentication check
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check
  if (user.role !== 'expected_role') {
    return <Navigate to={roleRedirects[user.role]} replace />;
  }

  // Authorized - render children
  return <>{children}</>;
}
```

### Route Integration
All role-specific routes are now wrapped with their respective protection:

```tsx
<Route element={<DashboardLayout allowedRoles={['admin']} />}>
  <Route path="/admin" element={<AdminProtectedWrapper><AdminDashboard /></AdminProtectedWrapper>} />
  <Route path="/admin/managers" element={<AdminProtectedWrapper><Managers /></AdminProtectedWrapper>} />
  {/* ... other admin routes */}
</Route>
```

## Security Benefits

1. **Layered Protection**: 
   - DashboardLayout provides first layer (role check)
   - Protected wrappers provide second layer (authentication + role verification)

2. **Prevent Direct Access**: 
   - Users cannot access routes by typing URLs directly
   - Unauthorized role switching is blocked

3. **Proper Redirects**:
   - Unauthenticated users go to login
   - Wrong-role users go to their correct dashboard
   - Maintains navigation history context

## Usage Examples

### Admin Access Only
```tsx
<Route path="/admin/projects" element={
  <AdminProtectedWrapper>
    <Projects />
  </AdminProtectedWrapper>
} />
```

### Manager Access Only
```tsx
<Route path="/manager/tasks" element={
  <ManagerProtectedWrapper>
    <ManagerTasks />
  </ManagerProtectedWrapper>
} />
```

### Worker Access Only
```tsx
<Route path="/worker/report" element={
  <WorkerProtectedWrapper>
    <SubmitReport />
  </WorkerProtectedWrapper>
} />
```

## Test Scenarios

1. **Unauthenticated Access**:
   - Navigate to `/admin/projects` without login
   - Should redirect to `/login`

2. **Wrong Role Access**:
   - Login as worker
   - Try to access `/admin/managers`
   - Should redirect to `/worker`

3. **Authorized Access**:
   - Login as admin
   - Navigate to `/admin/projects`
   - Should load the page normally

4. **Loading State**:
   - Page refresh while logged in
   - Should show loading spinner briefly
   - Then load the protected content

## Future Enhancements

- Add permission-based access within roles
- Implement more granular route protection
- Add audit logging for access attempts
- Create reusable hook for common protection patterns