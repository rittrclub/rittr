import { randomUUID } from "crypto";
import { readFileSync } from "fs";
import sqlite3 from "sqlite3";

const db = new sqlite3.Database("rittr.sqlite", () => {
  db.get(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='posts'",
    (err, row) => {
      if (err) throw new Error("Failed to load db");
      if (row) return console.info("Db ready");
      const createSQL = readFileSync("schema.sql").toString("utf8");
      db.exec(createSQL, (error) => {
        if (error)
          throw new Error("Failed to initialize schema:" + error.message);
        else console.info("Initialized database");
      });
    }
  );
});

export function query(sql, params, name) {
  console.info(name);
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      return err ? reject(rows) : resolve(rows);
    });
  });
}

export const uuid = randomUUID;
