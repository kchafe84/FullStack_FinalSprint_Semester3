const express = require("express");
const router = express.Router();
const historyDal = require("../services/postgres.userHistory.dal");

router.get("/", async (req, res) => {
  try {
    console.log(req.user._id);
    let theLogs = await historyDal.getHistoryByUserID(req.user._id);
    if (DEBUG) console.table(theLogs);
    res.render("userHistory", {
      theLogs,
      name: req.user.username,
      email: req.user.email,
      id: req.user._id,
    });
  } catch {
    res.render("503");
  }
});

module.exports = router;
