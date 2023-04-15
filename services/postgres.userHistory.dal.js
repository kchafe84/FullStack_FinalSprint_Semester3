// Used to fetch data from used history.

const dal = require("./postgres_db");

const { format } = require("date-fns");
const uuid = require("uuid");

const eventLogs = require("../eventLogger");

// Used to get a users history by user ID.

async function getHistoryByUserID(id) {
  return new Promise(function (resolve, reject) {
    let sql = `SELECT * FROM public."history" WHERE user_id = ${id};`;
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

// Used to add all users search history to the history log. 

async function addHistoryLog(
  userId,
  username,
  itemSearched,
  numberOfResults,
  dataBasedUsed
) {
  let currentDate = format(new Date(), "dd/MM/yyyy\tHH:mm:ss");
  let uuidv4 = uuid.v4();

  let SQL = `INSERT INTO public."history"(user_id, username, item_searched, db_used, search_results, date, uuid) VALUES ($1, $2, $3, $4, $5, $6, $7);`;
  try {
    let results = await dal.query(SQL, [
      userId,
      username,
      itemSearched,
      dataBasedUsed,
      numberOfResults,
      currentDate,
      uuidv4,
    ]);
    eventLogs(
      userId,
      username,
      itemSearched,
      dataBasedUsed,
      numberOfResults,
      currentDate,
      uuidv4
    );
    //return results.rows[0].userId;
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  getHistoryByUserID,
  addHistoryLog,
};
