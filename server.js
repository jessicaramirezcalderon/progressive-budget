const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const compression = require("compression");
require("dotenv").config();

const PORT = 3000;

const app = express();

app.use(logger("dev"));

app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

mongoose.connect(
  process.env.MONGODB_URI,
  {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
  }
);

// routes
app.use(require("./routes/api.js"));


//console log db connection for debugging
mongoose.connection.on('error', (e) => console.error(`connection error: ${e.message}`));
mongoose.connection.once('open', () => console.info('Successfully connected to the database.'));

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});