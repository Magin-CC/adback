'use strict';

const Service = require('egg').Service;

const createRule = {
  name: 'string',
  operator: 'string',
};

class AdslotService extends Service {

  async create(params) {
    const { ctx, app } = this;
    ctx.validate(createRule, params);
    const site = await app.model.Adslot.create(Object.assign({}, params, { createDate: new Date() }));
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
    const sites = await app.model.Adslot.find(query).skip(skip).limit(limit)
      .sort({ [sort]: -1 })
      .populate('operator', 'username')
      .populate('updater', 'username')
      .populate('site', 'name')
      .populate('ads.ads.ad', 'name')
      .populate('defaultAd', 'name')
      .lean();
    sites.forEach((v, k) => {
      if (!v.size) {
        sites[k].size = {
          imgHeight: 0,
          imgHeightOmg: true,
          imgWidth: 0,
          imgWidthOmg: true,
          textMax: 0,
          textMin: 0,
          textOmg: true,
        };
      }
    });
    const count = await app.model.Adslot.count(query);
    return { count, data: sites };
  }

  async delete(_id) {
    const data = await this.app.model.Adslot.deleteOne({ _id });
    return data;
  }

  async count() {
    return await this.app.model.Adslot.count();
  }

  async update(id, params) {
    const data = await this.app.model.Adslot.update({ _id: id }, params);
    const res = await this.app.model.Adslot.findOne({ _id: id }).populate('ads.ads.ad', 'name').populate('defaultAd', 'name');
    return res;
  }

  async findOne(_id) {
    const data = await this.app.model.Adslot.findOne({ _id }).populate('ads.ads.ad').populate('defaultAd');
    return data;
  }

  async setAd(_id, order, adId, slot, startDate, endDate) {
    const res = await this.app.model.Adslot.update({ _id }, {
      $set: {
        updater: this.ctx.session.user._id,
      },
      $push: {
        [`ads.${slot}.ads`]: {
          ad: adId,
          startDate,
          endDate,
          order,
        },
      },
    });
    return res;
  }
}

module.exports = AdslotService;
