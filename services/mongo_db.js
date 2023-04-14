const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB;
const pool = new MongoClient(uri);

module.exports = pool;
