'use strict';
const {entries, exec} = require('./utils.js');

/**
 * @param {Database} db
 * @param {string} method
 * @returns {(template:string[], ...values) => unknown}
 */
const getTag = (db, method) => (template, ...values) =>
                                db.prepare(template.join('?'))[method](...values);

/**
 * Returns better tags to deal with the database.
 * @param {Database}
 */
module.exports = db => ({
  db, entries,

  /**
   * Returns all rows, as objects, from the db.
   * @example
   *  all`SELECT * FROM table`; // [{id: 1}, {id: 2}]
   *  all`SELECT * FROM table WHERE id = ${2}`; // [{id: 2}]
   * @param {string[]} template
   * @param  {...any} values
   */
  all: getTag(db, 'all'),

  /**
   * Execute a generic query against the db.
   * @param {string[]} template
   * @param  {...any} values
   */
  exec: (template, ...values) => {
    exec(db, template, values);
  },

  /**
   * Returns one row from the db, if any.
   * @example
   *  get`SELECT * FROM table LIMIT 1`; // {id: 1}
   *  get`SELECT * FROM table WHERE id = ${2}`; // {id: 2}
   * @param {string[]} template
   * @param  {...any} values
   */
  get: getTag(db, 'get'),

  /**
   * Execute a generic query against the db.
   * @param {string[]} template
   * @param  {...any} values
   */
  run: (template, ...values) => {
    exec(db, template, values);
  },

  /**
   * Use a prepared statement to perform a transaction where
   * every interpolation is a list of values to be inserted per each run.
   * @example
   *  const rows = entries([{id: 1}, {id: 2}]);
   *  transaction`INSERT INTO table VALUES(${rows.id})`;
   * @param {string[]} template
   * @param  {...ProxyHandler<object[]>} values
   * @returns {Transaction}
   */
  transaction: (template, ...values) => {
    const statement = db.prepare(template.join('?'));
    const p = [];
    for (let i = 0; i < values.length; i++) {
      const value = values[i];
      for (let j = 0; j < value.length; j++)
        (j === p.length ? (p[j] = []) : p[j])[i] = value[j];
    }
    return db.transaction(() => {
      for (let i = 0; i < p.length; i++)
        statement.run(p[i]);
    });
  },

  /**
   * Returns all rows, as array of values, from the db.
   * @example
   *  values`SELECT * FROM table`; // [1, 2]
   *  values`SELECT * FROM table WHERE id = ${2}`; // [2]
   * @param {string[]} template
   * @param  {...any} values
   */
  values: getTag(db, 'values'),
});
