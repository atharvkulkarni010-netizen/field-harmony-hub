import * as userService from '../services/userService.js';

export const checkUserHierarchy = async (req, res, next) => {
  try {
    const { user } = req;
    const requestedUserId = req.params.user_id || req.body.user_id;

    if (user.role === 'ADMIN') {
      return next();
    }

    if (user.role === 'MANAGER') {
      // Manager can only access their own workers
      if (requestedUserId && requestedUserId !== user.user_id) {
        const targetUser = await userService.findUserById(requestedUserId);
        if (!targetUser || targetUser.manager_id !== user.user_id) {
          return res.status(403).json({ message: 'You can only access your team members' });
        }
      }
      return next();
    }

    if (user.role === 'WORKER') {
      // Worker can only access their own data
      if (requestedUserId && requestedUserId !== user.user_id) {
        return res.status(403).json({ message: 'You can only access your own data' });
      }
      return next();
    }
  } catch (error) {
    console.error('Hierarchy check error:', error);
    res.status(500).json({ message: 'Error checking access permissions' });
  }
};
