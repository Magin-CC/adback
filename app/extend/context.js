'use strict';
const _ = require('lodash');

module.exports = {
  success(res) {
    this.status = 200;
    this.body = _.assign(
      { status: 0 },
      { data: res }
    );
  },
  fail(code, res, status) {
    this.status = status || 500;
    this.body = _.assign({
      status: code,
    }, {
      error: res,
    });
  },
};
