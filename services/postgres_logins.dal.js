const dal = require("./postgres_db");

async function getLogins() {
  let SQL = `SELECT id AS _id, username, password, email, uuid FROM public."login";`;
  try {
    let results = await dal.query(SQL, []);
    return results.rows;
  } catch (error) {
    console.log(error);
  }
}
async function getLoginByEmail(email) {
  let SQL = `SELECT id AS _id, username, password, email, uuid FROM public."login" WHERE email = $1;`;
  try {
    let results = await dal.query(SQL, [email]);
    return results.rows[0];
  } catch (error) {
    console.log(error);
  }
}
async function getLoginById(id) {
  let SQL = `SELECT id AS _id, username, password, email, uuid FROM public."login" WHERE id = $1;`;
  try {
    let results = await dal.query(SQL, [id]);
    return results.rows[0];
  } catch (error) {
    console.log(error);
  }
}
async function addLogin(name, email, password, uuidv4) {
  let SQL = `INSERT INTO public."login"(username, email, password, uuid) VALUES ($1, $2, $3, $4) RETURNING id;`;
  try {
    let results = await dal.query(SQL, [name, email, password, uuidv4]);
    return results.rows[0].id;
  } catch (error) {
    console.log(error);
  }
}

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
