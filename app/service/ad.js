'use strict';

const Service = require('egg').Service;

const createRule = {
  name: 'string',
  operator: 'string',
};

class AdService extends Service {

  async create(params) {
    const { ctx, app } = this;
    ctx.validate(createRule, params);
    const site = await app.model.Ad.create(Object.assign({}, params, { createDate: new Date() }));
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
    if (params.site) {
      query.site = params.site;
    }
    if (params.type && params.type !== 'mixin') {
      query.type = params.type;
    }
    if (params.imgHeight && (params.type !== 'text')) {
      query['imageSize.height'] = params.imgHeight;
    }
    const sites = await app.model.Ad.find(query).skip(skip).limit(limit)
      .sort({ [sort]: -1 })
      .populate('operator', 'username')
      .populate('site', 'name');
    sites.forEach(v => {
      if (!v.imageSize && v.image && v.image.thumbUrl) {
        try {
          v.imageSize = ctx.helper.getImageSize(v.image.thumbUrl.split('/').slice(-1)[0]);
        } catch (e) {
          console.log('cant find img');
        }
      }
    });
    const count = await app.model.Ad.count(query);
    return { count, data: sites };
  }

  async delete(_id) {
    const data = await this.app.model.Ad.deleteOne({ _id });
    return data;
  }

  async count() {
    return await this.app.model.Ad.count();
  }

  async update(id, params) {
    const data = await this.app.model.Ad.updateOne({ _id: id }, params);
    return data;
  }

  async incVisit(id, count) {
    const data = await this.app.model.Ad.updateOne({ _id: id }, {
      $inc: { visited: count },
    });
    return data;
  }
}

module.exports = AdService;
