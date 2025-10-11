const { Pool } = require("pg")
require("dotenv").config()

/* ***************
 * Connection Pool
 * SSL Object needed for local testing of app
 * But also required for production environment on Render
 * This setup ensures it works in both development and production
 *************** */
const isDev = process.env.NODE_ENV === "development"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // required for both local dev and Render
})

/* ***************
 * Utility function to log queries during development
 * *************** */
async function query(text, params) {
  try {
    const res = await pool.query(text, params)
    if (isDev) console.log("executed query:", text)
    return res
  } catch (err) {
    console.error("Error executing query:", text, err)
    throw err
  }
}

/* ***************
 * Module Exports
 * Export both the pool and the query function
 *************** */
module.exports = {
  pool,
  query,
}
