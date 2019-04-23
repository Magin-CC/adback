'use strict';

const Service = require('egg').Service;
const _ = require('lodash');
const moment = require('moment');

const createRule = {
  adslot: 'string',
  ad: 'string',
  slot: 'int',
  // operator: 'string',
  // status: [0, 1, -1], // 0未审核  1审核通过 -1审核不通过
  startDate: 'string',
  endDate: 'string',
};

class OrderService extends Service {
  async createOrder(params) {
    this.ctx.validate(createRule, params);
    const order = await this.app.model.Order.create(_.assign(
      {}, params, { createDate: new Date(), status: 0, operator: this.ctx.session.user._id }));
    const _order = await this.app.model.Order.findById(order._id).populate('ad').populate('adslot');
    return _order;
  }
  async listOrders(params) {
    let query = params;
    const limit = +params.limit || 20,
      sort = params.sort || '_id',
      skip = +params.skip || 0;
    delete params.limit;
    delete params.sort;
    delete params.skip;
    query = _.pickBy(query, v => v);
    if (query.startDate || query.endDate) {
      query.createDate = {};
    }
    if (query.startDate) {
      query.createDate.$gte = moment(query.startDate);
      delete query.startDate;
    }
    if (query.endDate) {
      query.createDate.$lte = moment(query.endDate).add(1, 'd');
      delete query.endDate;
    }
    const orders = await this.app.model.Order.find(query).skip(skip).limit(limit)
      .sort({ [sort]: -1 })
      .populate('adslot')
      .populate('ad')
      .populate('operator', 'username');
    const count = await this.app.model.Order.count(query);
    return { count, data: orders };
  }
  async updateOrder(id, status) {
    const order = await this.app.model.Order.findByIdAndUpdate({ _id: id }, { status }).populate('ad').populate('adslot');
    return order;
  }
  async incVisit(id, count) {
    const data = await this.app.model.Order.updateOne({ _id: id }, {
      $inc: { visited: count },
    });
    return data;
  }
}
module.exports = OrderService;
