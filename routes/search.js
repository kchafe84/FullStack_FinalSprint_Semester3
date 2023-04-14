const express = require("express");
const router = express.Router();
const searchesDal = require("../services/mongo.vehicles.dal");
const historyDal = require("../services/postgres.userHistory.dal");
const searchesFromPostgressDal = require("../services/postgres.vehicles.dal");

router.get("/", async (req, res) => {
  if (DEBUG) console.log("user: " + req.user.username + " used the search bar");
  res.render("search.ejs", {
    name: req.user.username,
    email: req.user.email,
    id: req.user._id,
  });
});

router.get("/results", async (req, res) => {
  if (DEBUG) console.log("keyword searched: " + req.query.search);
  if (DEBUG) console.log("database used: " + req.query.db);

  if (req.query.db === "mongo") {
    try {
      let theSearches = await searchesDal.getSearchedVehicles(req.query.search);
      console.log(theSearches.length);
      if (DEBUG) console.table(theSearches);
      res.render("results", {
        theSearches,
        name: req.user.username,
        email: req.user.email,
        id: req.user._id,
        search: req.query.search,
        theDb: req.query.db == "both" ? "mongo & postgres" : req.query.db,
      });
      historyDal.addHistoryLog(
        req.user._id,
        req.user.username,
        req.query.search,
        theSearches.length,
        req.query.db == "both" ? "mongo & postgres" : req.query.db
      );
    } catch {
      res.render("503");
    }
  } else if (req.query.db === "postgres") {
    try {
      let theSearches = await searchesFromPostgressDal.getInfoBySearch(
        req.query.search
      );
      console.log(theSearches.length);
      if (DEBUG) console.table(theSearches);
      res.render("results", {
        theSearches,
        name: req.user.username,
        email: req.user.email,
        id: req.user._id,
        search: req.query.search,
        theDb: req.query.db == "both" ? "mongo & postgres" : req.query.db,
      });
      historyDal.addHistoryLog(
        req.user._id,
        req.user.username,
        req.query.search,
        theSearches.length,
        req.query.db == "both" ? "mongo & postgres" : req.query.db
      );
    } catch {
      res.render("503");
    }
  } else {
    try {
      let theSearchesMongo = await searchesDal.getSearchedVehicles(
        req.query.search
      );
      let theSearchesPG = await searchesFromPostgressDal.getInfoBySearch(
        req.query.search
      );
      console.log(theSearchesMongo.length);
      if (DEBUG) console.table(theSearchesMongo);
      console.log(theSearchesPG.length);
      if (DEBUG) console.table(theSearchesPG);

      res.render("results_pg_mongo", {
        theSearchesMongo,
        theSearchesPG,
        name: req.user.username,
        email: req.user.email,
        id: req.user._id,
        search: req.query.search,
        theDb: req.query.db == "both" ? "mongo & postgres" : req.query.db,
      });

      historyDal.addHistoryLog(
        req.user._id,
        req.user.username,
        req.query.search,
        theSearchesMongo.length + theSearchesPG.length,
        req.query.db == "both" ? "mongo & postgres" : req.query.db
      );
    } catch {
      res.render("503");
    }
  }
});

module.exports = router;
