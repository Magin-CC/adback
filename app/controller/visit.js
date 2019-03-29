'use strict';

const Controller = require('egg').Controller;
const moment = require('moment');
class Visit extends Controller {
  async index() {
    const { service, ctx } = this;
    const query = ctx.request.query;
    const params = {};
    if (query.site) {
      params.site = query.site;
    }
    if (query.startDate) {
      params.createDate = { $gt: moment(query.startDate) };
    }
    if (query.endDate) {
      params.createDate = Object.assign({}, params.createDate || {}, { $lt: moment(query.endDate) });
    }
    const data = await service.visit.listByFields(params);
    ctx.body = { status: 0, detail: data };
  }
}
module.exports = Visit;
