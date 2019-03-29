'use strict';
const Service = require('egg').Service;

class VisitService extends Service {
  async create(params) {
    const data = await this.app.model.Visit.create(Object.assign({}, params, { createDate: new Date() }));
    return data;
  }
  async count(date) {
    const count = await this.app.model.Visit.count({ createDate: { $gt: date } });
    return count;
  }
  async listByFields(params) {
    const data = await this.app.model.Visit.find(params).populate('ad', 'name').populate('site', 'name');
    return data;
  }
}
module.exports = VisitService;
