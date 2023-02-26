// console.log("Hello from Denys and Andrey");
const express = require("express");
const app = express();
app.use(express.static("public"));

const { engine } = require("express-handlebars");
// set tamplate engine
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "backend/views");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
require("colors");
const path = require("path");
const configPath = path.join(__dirname, "..", "config", ".env");
const asyncHandler = require("express-async-handler");
require("dotenv").config({ path: configPath });
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const auth = require("./middlewares/auth");

// console.log(require("dotenv").config({ path: configPath }));
const { PORT = 5001 } = process.env;
const connectDb = require("../config/db");

const sendEmail = require("./services/sendEmail");

//setRoutes

app.use("/api/v1", require("./routes/filmsRoutes"));

// Реєстрація - це збереження користувача в БД
// Аутентифікація - перевірка даних, що ввів користувач з тим що є в БД
// Авторизація - перевірка прав доступу
// Логаут - вихід із системи

const usersModel = require("./models/usersModel");
const rolesModel = require("./models/rolesModel");

app.post(
  "/register",
  asyncHandler(async (req, res) => {
    // отримує дані про користувача і валідуємо
    const { password, email } = req.body;

    if (!password || !email) {
      res.status(400);
      throw new Error("Please, provide all required fields");
    }

    // перевіряємо чи є такий користувач в БД
    const candidate = await usersModel.findOne({ email });

    // якщо є - повідомляємо що такий користувач вже існує
    if (candidate) {
      res.status(400);
      throw new Error("User already exists");
    }

    // якщо нема - хешуємо пароль
    const hash = bcrypt.hashSync(password, 5);

    // зберігаємо користувача в БД
    const role = await rolesModel.findOne({ value: "USER" });
    const user = await usersModel.create({
      ...req.body,
      password: hash,
    });

    user.roles.push(role.value);
    await user.save();

    if (!user) {
      res.status(400);
      throw new Error("Unable to save user");
    }

    res.status(201).json({
      code: 201,
      message: "success",
      data: {
        email: user.email,
        name: user.name,
        roles: user.roles,
      },
    });
  })
);

app.post(
  "/login",
  asyncHandler(async (req, res) => {
    // отримує дані про користувача і валідуємо
    const { password, email } = req.body;

    if (!password || !email) {
      res.status(400);
      throw new Error("Please, provide all required fields");
    }

    // шукаємо користувача в БД і перевіряємо пароль на валідність
    const user = await usersModel.findOne({ email });
    const correctPassword = bcrypt.compareSync(password, user.password);

    // якщо не знайли чи невалідний пароль => кидаємо помилку
    if (!user || !correctPassword) {
      res.status(400);
      throw new Error("Invalid email or password");
    }

    // якщо знайшли і пароль валідний - видаємо токен
    const token = generateToken(user._id);
    user.token = token;
    const isUpdatedToken = await user.save();

    if (!isUpdatedToken) {
      res.status(400);
      throw new Error("Unable to set token");
    }

    res.status(200).json({
      code: 200,
      message: "success",
      data: {
        email: user.email,
        token: user.token,
      },
    });
  })
);

app.get(
  "/logout",
  auth,
  asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const user = await usersModel.findByIdAndUpdate(_id, { token: null });

    if (!user) {
      res.status(400);
      throw new Error("Unable to logout");
    }

    res.status(200).json({
      code: 200,
      message: "logout success",
    });
  })
);

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/contact", (req, res) => {
  res.render("contact");
});

app.post("/send", async (req, res) => {
  // res.send(req.body);
  try {
    await sendEmail(req.body);

    return res.status(200).render("send", {
      message: "success",
      name: req.body.name,
      email: req.body.email,
    });
  } catch (error) {
    return res.status(400).json(error.message);
  }
});

const errorHandler = require("./middlewares/errorHandler");
const errorRoutesHandler = require("./middlewares/errorRoutesHandler");

app.use("*", errorRoutesHandler);

app.use(errorHandler);

connectDb();
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`.green.bold.italic);
});

function generateToken(data) {
  const payload = { data };
  const token = jwt.sign(payload, "pizza", { expiresIn: "3h" });
  return token;
}
