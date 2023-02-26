const { model, Schema } = require("mongoose");

const schemaRoles = Schema({
  value: {
    type: String,
  },
});

module.exports = model("roles", schemaRoles);

// ["ADMIN", "MODERATOR", "USER", "CUSTOMER", "EDITOR']
