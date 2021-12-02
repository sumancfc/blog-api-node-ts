const express = require("express");
const fs = require("fs");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const csrf = require("csurf");
require("dotenv").config();

const csrfProtection = csrf({ cookie: true });

//app
const app = express();

//databse connect
mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database Connected!!!"))
  .catch((err) => console.log(err));

//middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cookieParser());

//cors
if (process.env.NODE_ENV === "development") {
  app.use(cors({ origin: `${process.env.CLIENT_URL}` }));
}
// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept, Authorization"
//   );
//   next();
// });

//routes
fs.readdirSync("./routes").map((r) =>
  app.use("/api/v1", require(`./routes/${r}`))
);

//csrf
app.use(csrfProtection);

app.get("/api/v1/csrf-token", (req, res, next) => {
  res.json({ csrfToken: req.csrfToken() });
  next();
});

//port
const port = process.env.PORT || 8000;

//server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
