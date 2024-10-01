const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../db/database");
const router = express.Router();
const {
  getUserByUsername,
  checkTokenAvailable,
  getActiveTokenCount,
  updatelogoutMac,
  InsertMac,
  getAllUsers,
  GetAllMac,
} = require("../services/user"); // Adjust the path if necessary

// Register
router.post("/register", (req, res) => {
  console.log(req);
  const { username, password } = req.body;
  console.log(username, password);
  // Hash the password
  const hashedPassword = bcrypt.hashSync(password, 8);

  const stmt = db.prepare(
    "INSERT INTO users (username,  password) VALUES (?,  ?)"
  );
  stmt.run(username, hashedPassword, function (err) {
    if (err) {
      return res
        .status(400)
        .json({ message: "User registration failed", error: err.message });
    }
    res.status(201).json({ message: "User registered successfully" });
  });
  stmt.finalize();
});

// Login
router.post("/login", async (req, res) => {
  const { username, password, mac } = req.body;
  console.log(mac);
  try {
    // Get user by username
    const user = await getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) {
      return res
        .status(401)
        .json({ token: null, message: "Invalid credentials" });
    }
    // Generate JWT
    const token = jwt.sign({ id: user.id, mac: mac }, "secret", {
      expiresIn: 86400,
    }); // 24 hours
    const Macs = await GetAllMac(user.id);
    console.log(Macs);
    try {
      if (Macs.length >= 4) {
        res.status(200).json({
          msg: "There are more 4 tokens ",
        });
        return;
      }
      console.log(`Current token count: ${Macs.length}`);
    } catch (err) {
      return res.status(500).json({ error: "Failed to get token count" });
    }

    // Insert token
    await InsertMac(user.id, mac);

    // Send response
    res.status(200).json({
      id: user.id,
      username: user.username,
      token,
      msg: "success",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred", error });
  }
});

router.post("/logout", async (req, res) => {
  const { userid, mac } = req.body;
  if (mac == null || userid == null) {
    console.log("123");
    res.status(200).json({
      id: userid,
      msg: "mac address null",
    });
  }
  try {
    // Get user by username
    // Insert token
    await updatelogoutMac(userid, mac);

    // Send response
    res.status(200).json({
      id: userid,
      msg: "success",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred", error });
  }
});

router.post("/user/logout", async (req, res) => {
  const { token } = req.body; // Assuming the token is sent as a query parameter
  console.log(token);
  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }
  const decoded = jwt.verify(token, "secret");
  const mac = decoded.mac;
  const userid = decoded.id;
  try {
    await updatelogoutMac(userid, mac);
    res.status(200).json({
      id: userid,
      msg: "success",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred", error });
  }
});

router.post("/Mac/check", async (req, res) => {
  const { token } = req.body; // Assuming the token is sent as a query parameter
  console.log(token);
  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }
  try {
    const exists = await checkTokenAvailable(token);
    console.log(exists);
    if (exists) {
      return res.status(200).json({ message: "Token exists", available: true });
    } else {
      return res
        .status(404)
        .json({ message: "Token does not exist", available: false });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred", error });
  }
});
router.get("/users", async (req, res) => {
  try {
    const users = await getAllUsers();
    if (users) {
      return res.status(200).json({ users: users });
    } else {
      return res.status(404).json({ message: "All User failed" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred", error });
  }
});
router.get("/users/download", async (req, res) => {
  try {
    res.sendFile(path.join(__dirname, "public", "user.html"));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred", error });
  }
});
router.post("/macs", async (req, res) => {
  try {
    const { userid } = req.body;
    const macs = await GetAllMac(userid);
    if (macs) {
      return res.status(200).json({ macs: macs });
    } else {
      return res.status(404).json({ message: "All User failed" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred", error });
  }
});
module.exports = router;
