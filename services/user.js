const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../db/database");
const getUserByUsername = (username) => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM users WHERE username = ?",
      [username],
      (err, user) => {
        if (err) return reject(err);
        resolve(user);
      }
    );
  });
};
const checkTokenAvailable = (token) => {
  return new Promise((resolve, reject) => {
    const decoded = jwt.verify(token, "secret");
    const mac = decoded.mac;
    const userid = decoded.id;
    console.log(decoded);
    console.log(decoded.id);
    db.get(
      "SELECT COUNT(*) AS count FROM user_macs WHERE mac = ? and user_id = ?",
      [mac, userid],
      (err, row) => {
        if (err) return reject(err);
        resolve(row.count > 0); // Return true if count is greater than 0
      }
    );
  });
};

const getActiveTokenCount = () => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT COUNT(*) AS count FROM users WHERE token_status = 1",
      [],
      (err, row) => {
        if (err) return reject(err);
        resolve(row.count);
      }
    );
  });
};
const InsertMac = (userId, mac) => {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(
      "INSERT INTO user_macs (user_id, mac) VALUES (?, ?)"
    );
    stmt.run(userId, mac, function (err) {
      if (err) return reject(err);
      resolve(this.changes > 0); // Returns true if a row was updated
    });
    stmt.finalize();
  });
};
const GetAllMac = (userId) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM user_macs WHERE user_id= ?";
    db.all(sql, [userId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};
const updatelogoutMac = (userId, mac) => {
  return new Promise((resolve, reject) => {
    let sql = "DELETE FROM user_macs WHERE user_id = ?";
    const params = [userId];

    if (mac !== null) {
      sql += " AND mac = ?";
      params.push(mac);
    }
    db.run(sql, params, function (err) {
      if (err) {
        return reject(err); // Reject the promise on error
      }
      console.log(`Deleted MAC address with ID: ${mac}`);
      resolve("success"); // Resolve the promise on success
    });
  });
};

const getAllUsers = () => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM users ";
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};
module.exports = {
  getUserByUsername,
  checkTokenAvailable,
  getActiveTokenCount,
  GetAllMac,
  InsertMac,
  updatelogoutMac,
  getAllUsers,
};
