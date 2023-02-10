class Database {
  constructor() {
    this.args = null;
  }
  exec(...args) {
    this.args = args;
  }
  prepare(...args) {
    return new Statement(...args);
  }
  query(...args) {
    return new Statement(...args);
  }
  transaction(fn) {
    return Object.assign(fn, {deferred() {}});
  }
}

class Statement {
  constructor(...args) {
    this.args = args;
  }
  get paramsCount() {
    return this.args[0].split('?').length - 1;
  }
  all(...args) {
    return args;
  }
  get(...args) {
    return args;
  }
  run(...args) {
    this.args = args;
  }
  values(...args) {
    return args;
  }
}

test(require('../cjs'));
test(require('../cjs/cached'));

function test(createTags) {
  const {all, entries, exec, get, run, transaction, values} = createTags(new Database);
  const name = 'test';
  console.assert(all`INSERT INTO table (name) VALUES (${name})`.join(',') === 'test');
  console.assert(get`INSERT INTO table (name) VALUES (${name})`.join(',') === 'test');
  console.assert(values`INSERT INTO table (name) VALUES (${name})`.join(',') === 'test');
  const fields = entries([
    {name: 'a', age: 0},
    {name: 'b', age: 1}
  ]);
  const t = transaction`INSERT INTO table (name, age) VALUES (${fields.name}, ${fields.age})`;
  t.deferred();
  t();
  exec`INSERT INTO table (name) VALUES (${name})`;
  run`INSERT INTO table (name) VALUES (${name})`;
  try {
    get([`INSERT INTO table (name) VALUES (${name})`], name);
  }
  catch ({message}) {
    console.assert(message === 'Invalid statement: INSERT INTO table (name) VALUES (test)');
  }
}
