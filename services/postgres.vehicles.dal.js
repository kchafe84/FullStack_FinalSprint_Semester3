// Used to fetch data from mongo database.

const dal = require("./postgres_db");

// Function that inserts a query statement to the postgres database to find matches for the keyword(s) entered across all columns.


async function getInfoBySearch(search) {
  return new Promise(function (resolve, reject) {
    let sql = `select * from public."vehicle"
    where to_tsvector(year || ' ' || brand || ' ' || model || ' ' || colour || ' ' || country || ' ' || city || ' ' || address) @@ to_tsquery('${search}');`;
    dal.query(sql, [], (err, result) => {
      if (err) {
        if (DEBUG) console.log(err);
        reject(err);
      } else {
        resolve(result.rows);
      }
    });
  });
}

module.exports = {
  getInfoBySearch,
};
