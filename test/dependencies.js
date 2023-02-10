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

const {db, all, get, exec, entries, transaction} = createTags(
  new Database(join(__dirname, 'test.sql'))
);

exec`DROP TABLE IF EXISTS people`;

exec`CREATE TABLE people (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  age INTEGER
)`;

console.assert(JSON.stringify(all`SELECT * FROM people`) === '[]');

const people = entries([
  {name: 'a', age: 0},
  {name: 'b', age: 1}
]);

transaction`INSERT INTO people (name, age) VALUES (${people.name}, ${people.age})`.default();

console.assert(JSON.stringify(all`SELECT * FROM people`) === '[{"id":1,"name":"a","age":0},{"id":2,"name":"b","age":1}]');
console.assert(JSON.stringify(get`SELECT * FROM people WHERE id=${2}`) === '{"id":2,"name":"b","age":1}');

db.close();
console.timeEnd(time);
