const express = require("express");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/auth");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(bodyParser.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.use(bodyParser.json()); // For parsing application/json
app.use("/files", express.static(path.join(__dirname, "files")));
app.use(express.static(path.join(__dirname, "public")));
app.use("/api/auth", authRoutes);

app.get("/download/exe", (req, res) => {
  const file = path.join(__dirname, "files", "main.zip");
  res.download(file, "main.zip", (err) => {
    if (err) {
      console.error("Error downloading file:", err);
      res.status(500).send("File not found");
    }
  });
});
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});
app.get("/download", async (req, res) => {
  try {
    res.sendFile(path.join(__dirname, "public", "user.html"));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred", error });
  }
});
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "register.html"));
});
app.get("/manage", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "manage.html"));
});
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
