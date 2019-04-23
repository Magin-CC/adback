'use strict';

const { Service } = require('egg');
const _ = require('lodash');

const createRule = {
  number: 'string',
  contractName: 'string',
  scheduleName: 'string',
};

class ContractService extends Service {
  async create(params) {
    const { app, ctx } = this;
    ctx.validate(createRule, params);
    const res = await app.model.Contract.create(_.assign({},
      params,
      { createDate: new Date(), operator: ctx.session.user._id }));
    return res;
  }
  async list(params) {
    const { app } = this;
    const query = {};
    const res = await app.model.Contract.find(query).populate('operator', 'username');
    const count = await app.model.Contract.count();
    return { data: res, count };
  }
}

module.exports = ContractService;
