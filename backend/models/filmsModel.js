const { model, Schema } = require("mongoose");
const schemaFilms = Schema({
  title: {
    type: String,
    required: [true, "db: film title is required"],
  },
  director: { type: String, default: "Martin Scorcese" },
  rating: { type: Number, default: 0.0 },
  year: {
    type: Number,
    required: [true, "db: film year is required"],
  },
});

module.exports = model("films", schemaFilms);
