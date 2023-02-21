'use strict';
const handler = {
  get(objects, field) {
    const fields = [];
    for (let i = 0; i < objects.length; i++)
      fields[i] = objects[i][field];
    return fields;
  }
};

/**
 * Given a list of objects, returns an array of each object
 * field value once accessed via field name.
 * @example
 *  entries([{a: 1}, {a: 2}]).a; // [1, 2]
 * @param {object[]} objects
 * @returns {ProxyHandler<object[]>}
 */
const entries = objects => new Proxy(objects, handler);
exports.entries = entries;

const exec = (db, template, values) => {
  // better sqlite3
  /* c8 ignore start */
  if (db.constructor.SqliteError) {
    const query = [template[0]];
    for (let i = 1; i < template.length; i++) {
      const type = typeof values[i - 1];
      const value = String(values[i - 1]);
      query.push(
        type === 'string' ? `'${value.replace(/'/g, "''")}'` : value,
        template[i]
      );
    }
    db.exec(query.join(''));
  }
  /* c8 ignore end */
  // bun
  else
    db.exec(template.join('?'), ...values);
};
exports.exec = exec;
