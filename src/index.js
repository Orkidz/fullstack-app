const Express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const { notFound, errorHandler } = require("./middlewares");
const middlewares = require("./middlewares");
const mongoose = require("mongoose");
const twisted = require("twisted");
require("dotenv").config();

// Connection to MongoDB
mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true });

// Create new express application
const app = Express();

// Logger and Cors middleware for request logging/permission
app.use(morgan("common"));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
  })
);

//Route
app.get("/", (req, res) => {
  res.send("Hello World");
});

// Error middlewares
app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

// Connection to port with a callback function logging `Listening at http://localhost:${port}` in the terminal
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
