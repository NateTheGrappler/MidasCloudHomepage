const DATA_BASE = require('better-sqlite3'); //import sqlite 
const database = new DATA_BASE('portal.db'); //opens connection to database on app startup

//this basically creates the table inside of the given database object
//it runs every single time this file does, and only actually creates the table if
//it does not exist, it populates the general status of the table with needed fields
//for functionality
database.exec(`
    CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL,
    password_hash TEXT,
    hasDefaultPwd INTEGER CHECK (hasDefaultPwd IN (0, 1)),
    status TEXT NOT NULL DEFAULT 'pending',
    vaultLink TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reasonForRequest TEXT
    )
    `);

module.exports = database;