const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const { connectToMongoDB } = require("./connect");
const { restrictToLoggedinUserOnly, checkAuth } = require("./middlewares/auth");
const URL = require("./models/url");

const urlRoute = require("./routes/url");
const staticRoute = require("./routes/staticRouter");
const userRoute = require("./routes/user");

const app = express();
const PORT = process.env.PORT || 5000;
//const MONGODB_URI = "mongodb+srv://abhi2104shek_db_user:0wfVFi8KubDxOaQ9@cluster0.je3brme.mongodb.net/?appName=Cluster0"
const MONGODB_URI="mongodb+srv://abhi2104shek_db_user:0wfVFi8KubDxOaQ9@cluster0.je3brme.mongodb.net/short-url?retryWrites=true&w=majority";

// connectToMongoDB(process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/short-url").then(() =>

// connectToMongoDB(MONGODB_URI ?? "mongodb://127.0.0.1:27017/short-url").then(() =>
//   console.log("Mongodb connected")
// );

connectToMongoDB(MONGODB_URI).then(() =>
  console.log("Mongodb connected")
);

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/url", restrictToLoggedinUserOnly, urlRoute);
app.use("/user", userRoute);
app.use("/", checkAuth, staticRoute);

app.get("/url/:shortId", async (req, res) => {
  const shortId = req.params.shortId;
  const entry = await URL.findOneAndUpdate(
    {
      shortId,
    },
    {
      $push: {
        visitHistory: {
          timestamp: Date.now(),
        },
      },
    }
  );
  res.redirect(entry.redirectURL);
});

app.listen(PORT, () => console.log(`Server Started at PORT:${PORT}`));
