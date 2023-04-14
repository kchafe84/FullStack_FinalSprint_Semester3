const { format } = require("date-fns");

const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");

const eventLogs = async (
  userID,
  username,
  itemSearched,
  dbUsed,
  numResults,
  currentDate,
  uu_id
) => {
  var itemToLog = `User ID: ${userID}\t Username: ${username}\t Searched: [${itemSearched}]\t DB used: ${dbUsed}\t Results: [${numResults}] Date: ${currentDate} Uuid: ${uu_id}`;

  try {
    if (!fs.existsSync(path.join(__dirname, "historyLogs"))) {
      await fsPromises.mkdir(path.join(__dirname, "historyLogs"));
    }
    const fileName = `${format(new Date(), "yyyyMMdd")}` + "_httpevents.log";
    await fsPromises.appendFile(
      path.join(__dirname, "historyLogs", fileName),
      itemToLog + "\n"
    );
  } catch (error) {
    console.log(error);
  }
};

module.exports = eventLogs;
