const express = require("express");

const filmsRouter = express.Router();

const asyncHandler = require("express-async-handler");

const filmsController = require("../controllers/FilmsController");
const rolesMiddleware = require("../middlewares/rolesMiddleware");

//localhost:5000/api/v1/films
//додати фільм
filmsRouter.post(
  "/films",
  (req, res, next) => {
    console.log("Joi validation");
    next();
  },
  asyncHandler(filmsController.add)
);

//отримати всі фільми
filmsRouter.get(
  "/films",
  rolesMiddleware(["ADMIN", "MODERATOR"]),
  asyncHandler(filmsController.getAll)
);

//отримати один фільм
filmsRouter.get("/films/:id", asyncHandler(filmsController.getOneFilm));

//обновити фільм
filmsRouter.put("/films/:id", asyncHandler(filmsController.updateFilm));

//видалити фільм
filmsRouter.delete("/films/:id", asyncHandler(filmsController.removeFilm));

module.exports = filmsRouter;
