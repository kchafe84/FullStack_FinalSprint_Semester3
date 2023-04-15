// Used to fetch data from mongo database.

const { ObjectId } = require("mongodb");
const dal = require("./mongo_db");

// Function that takes in the search keyword & searchs through the mongo database to finds matches.

async function getSearchedVehicles(search) {
  try {
    await dal.connect();
    const cursor = await dal
      .db("fs_finalsprint_solo_db")
      .collection("vehicle")
      .find({ $text: { $search: `${search}` } });
    const results = await cursor.toArray();
    return results;
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  getSearchedVehicles,
};
