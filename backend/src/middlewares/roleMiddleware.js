export const authorizeRoles = (...roles) => {
  return (req, res, next) => {


    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied",
        debug: {
          userRole: req.user?.role,
          allowedRoles: roles
        }
      });
    }

    next();
  };
};
