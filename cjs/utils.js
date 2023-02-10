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
  db.exec(template.join('?'), ...values);
};
exports.exec = exec;
