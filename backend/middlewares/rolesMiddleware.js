const jwt = require("jsonwebtoken");
const usersModel = require("../models/usersModel");

module.exports = (rolesAcceptArray) => {
  //   console.log(roles);
  return async function (req, res, next) {
    try {
      const { authorization } = req.headers;
      const [Bearer, token] = authorization.split(" ");

      if (!token || Bearer !== "Bearer") {
        res.status(401);
        throw new Error("Not authorized");
      }

      const { data: ID } = jwt.verify(token, "pizza");
      const user = await usersModel.findById(ID);

      const userRoles = user.roles;

      let hasRole = false;

      userRoles.forEach((role) => {
        if (rolesAcceptArray.includes(role)) {
          hasRole = true;
        }
      });

      if (!hasRole) {
        return res.status(403).json({ code: 403, message: "Forbidden" });
      }

      next();
    } catch (error) {
      return res.status(403).json({ code: 403, message: "Forbidden" });
    }
  };
};
