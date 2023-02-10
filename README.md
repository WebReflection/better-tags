# better-tags

[![build status](https://github.com/WebReflection/better-tags/actions/workflows/node.js.yml/badge.svg)](https://github.com/WebReflection/better-tags/actions) [![Coverage Status](https://coveralls.io/repos/github/WebReflection/better-tags/badge.svg?branch=main)](https://coveralls.io/github/WebReflection/better-tags?branch=main)


A way to handle SQLite with template literal tags that works seamlessly with both [bun](https://bun.sh/) and Nodejs' [better-sqlite3](https://www.npmjs.com/package/better-sqlite3) module, or even other modules exposing the same API, offering both a greedly cached variant or a non cached (default) one.

```js
// for cached variant:
// import createSQLiteTags from 'better-tags/cached';
import createSQLiteTags from 'better-tags';

// for better-sqlite3 variant:
// import Database from 'better-sqlite3';
import {Database} from 'bun:sqlite';

const {
  db,         // the db passed along

  // retrieve results
  get,        // as single row
  all,        // as all rows
  values,     // as rows with array of values

  // just execute queries
  exec,       // alias for run
  run,        // alias for exec

  // transactions related
  entries,    // passes along fields
  transaction // execut a transaction
} = createSQLiteTags(new Database);

exec`CREATE TABLE people (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  age INTEGER
)`;

// entries helps passing along homogeneous
// collections as fields per each transaction
// statements that will be run later on
const people = entries([
  {name: 'a', age: 0},
  {name: 'b', age: 1}
]);

// will execute multiple times the statement
// first with 'a' and 0, then with 'b' and 1
transaction`
  INSERT INTO people (name, age)
  VALUES (${people.name}, ${people.age})
`.default();
// transaction`...`():void
// transaction`...`.default():void
// transaction`...`.deferred():void
// transaction`...`.exclusive():void
// transaction`...`.immediate():void

console.log(
  all`SELECT * FROM people`
);
// [{id: 1, name: "a", age: 0}, {id: 2, name: "b", "age": 1}]

const name = 'b';
console.log(
  get`SELECT * FROM people WHERE name = ${name}`
);
// {id: 2, name: "b", "age": 1}

db.close();
```

### Cached VS Non-cached

If your project uses one or few databases all the time, and there is enough heap/memory to deal with all possible queries and resulting statements, the `better-tags/cached` export will grant faster repeated execution in either *bun* or *Nodejs*.

If your project uses randomly defined databases though, the default export tries not to cache anything, neither via the module itself, nor through the internal cache *bun*, as example, could use. This is ideal for general purpose targets such as IoT devices and projects that cannot know AOT how many databases or queries should be handled.

Please note that the *cached* variant accepts a `Map` or `WeakMap` as second argument, so that you can control/fine-tune the caching exposed through this module, but *bun* internally doesn't offer this ability so that cached statements migt remain, or sature, the available cache.


### What about pragma?

I am afraid `.pragma(...)` is not equally available in [bun](https://github.com/oven-sh/bun/issues/2023) and *beter-sqlite3* so that using `exec` or `run`, among regular *SELECT* options is the way to set or retrieve pragma details.

```js
// nope
all`PRAGMA table_info(${name})`;

// yup
all`SELECT * FROM pragma_table_info(${name})`;
```


#### Is it safe or is this SQLInjection prone?

Every interpolation results into a boud `?` parameter so that if these are not exactly the same amount of expected parameters the module will throw an error.
