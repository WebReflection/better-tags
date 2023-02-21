const {join} = require('node:path');

let Database, time;

try {
  ({Database} = require('bun:sqlite'));
  console.time(time = 'bun:sqlite');
}
catch (_) {
  (Database = require('better-sqlite3'));
  console.time(time = 'better-sqlite3');
}

const createTags = require('../cjs/index.js');

const {db, all, exec, run} = createTags(
  new Database(join(__dirname, 'test.sql'))
);

exec`
CREATE TABLE IF NOT EXISTS persons (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL,
	phone TEXT NOT NULL,
	company TEXT NOT NULL
)
`;

run`
INSERT INTO persons
  (name, phone, company)
VALUES
  (${'test' + Math.random()}, ${String(Date.now())}, 'fly.io')
`;

console.log(all`SELECT * FROM persons`);

db.close();
console.timeEnd(time);
