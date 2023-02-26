const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const connectDb = async () => {
  try {
    const db = await mongoose.connect(process.env.DB_STRING);
    console.log(
      `Database is connected: ${db.connection.name}, on port: ${db.connection.port},on host: ${db.connection.host}`
        .bold.green.italic
    );
  } catch (error) {
    console.log(error.message.bold.red);
  }
};

module.exports = connectDb;

// const Cat = mongoose.model("Cat", { name: String });

// const kitty = new Cat({ name: "Zildjian" });
// kitty.save().then(() => console.log("meow"));
