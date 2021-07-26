const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

const { errorHandler, errorNotFound } = require("./middlewares/dbErrorHandler");

//import routes
const blogRoutes = require("./routes/blog");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const categoryRoutes = require("./routes/category");
const tagRoutes = require("./routes/tag");

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
if (process.env.NODE_ENV === "development")
  app.use(cors({ origin: `${process.env.CLIENT_URL}` }));

//routes
app.use("/api/v1", blogRoutes);
app.use("/api/v1", authRoutes);
app.use("/api/v1", userRoutes);
app.use("/api/v1", categoryRoutes);
app.use("/api/v1", tagRoutes);

//eror
app.use(errorNotFound);
app.use(errorHandler);

//port
const port = process.env.PORT || 8000;

//server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
