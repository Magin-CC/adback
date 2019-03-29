'use strict';

const Service = require('egg').Service;

const createRule = {
  name: 'string',
  operator: 'string',
};

class SiteService extends Service {

  async create(params) {
    const { ctx, app } = this;
    ctx.validate(createRule, params);
    const site = await app.model.Site.create(Object.assign({}, params, { createDate: new Date() }));
    return site;
  }

  async list(params) {
    params = JSON.parse(JSON.stringify(params));
    const { ctx, app } = this,
      limit = +params.limit || 20,
      sort = params.sort || '_id',
      skip = +params.skip || 0;
    delete params.limit;
    delete params.sort;
    delete params.skip;
    const query = {};
    if (params.name) {
      query.name = { $regex: params.name };
    }
    if (params.operator) {
      query.operator = params.operator;
    }

    const sites = await app.model.Site.find(query).skip(skip).limit(limit)
      .sort({ [sort]: -1 })
      .populate('operator', 'username');
    const count = await app.model.Site.count(query);
    return { count, data: sites };
  }

  async delete(_id) {
    const data = await this.app.model.Site.deleteOne({ _id });
    return data;
  }

  async count() {
    return await this.app.model.Site.count();
  }
  async update(id, params) {
    const _ = await this.app.model.Site.updateOne({ _id: id }, params);
    const data = await this.app.model.Site.findOne({ _id: id });
    return data;
  }
}

module.exports = SiteService;
