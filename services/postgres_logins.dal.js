// Used to insert query statements to the postgres database & fetch data.

const dal = require("./postgres_db");

// Used to get all login data.

async function getLogins() {
  let SQL = `SELECT id AS _id, username, password, email, uuid FROM public."login";`;
  try {
    let results = await dal.query(SQL, []);
    return results.rows;
  } catch (error) {
    console.log(error);
  }
}

// Used to get login data by email.

async function getLoginByEmail(email) {
  let SQL = `SELECT id AS _id, username, password, email, uuid FROM public."login" WHERE email = $1;`;
  try {
    let results = await dal.query(SQL, [email]);
    return results.rows[0];
  } catch (error) {
    console.log(error);
  }
}

// Used to get login information by ID.

async function getLoginById(id) {
  let SQL = `SELECT id AS _id, username, password, email, uuid FROM public."login" WHERE id = $1;`;
  try {
    let results = await dal.query(SQL, [id]);
    return results.rows[0];
  } catch (error) {
    console.log(error);
  }
}

// Used to add a new used to login database. 

async function addLogin(name, email, password, uuidv4) {
  let SQL = `INSERT INTO public."login"(username, email, password, uuid) VALUES ($1, $2, $3, $4) RETURNING id;`;
  try {
    let results = await dal.query(SQL, [name, email, password, uuidv4]);
    return results.rows[0].id;
  } catch (error) {
    console.log(error);
  }
}

// Used by the account router to fetch a users login data by login ID.

async function getAccountById(id) {
  return new Promise(function (resolve, reject) {
    const sql = `SELECT id AS _id, username, password, email, uuid FROM public."login" WHERE id = $1;`;
    dal.query(sql, [id], (err, result) => {
      if (err) {
        if (DEBUG) console.log(err);
        reject(err);
      } else {
        resolve(result.rows);
      }
    });
  });
}

// Used to update a users username.

var patchAccount = function (id, username) {
  return new Promise(function (resolve, reject) {
    const sql = `UPDATE public."login" SET username=$2 WHERE id=$1;`;
    dal.query(sql, [id, username], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result.rows);
      }
    });
  });
};

module.exports = {
  getLogins,
  addLogin,
  getLoginByEmail,
  getLoginById,
  getAccountById,
  patchAccount,
};
