export const ROLES = {
  ADMIN: "admin",
  USER:  "user",
};

export const hasRole = (user, ...roles) =>
  roles.includes(user?.role?.toLowerCase());

export const isAdmin = (user) => hasRole(user, ROLES.ADMIN);
export const isUser  = (user) => hasRole(user, ROLES.USER);
