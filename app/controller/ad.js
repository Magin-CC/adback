'use strict';

const Controller = require('egg').Controller;
const _ = require('lodash');
class AdController extends Controller {
  async create() {
    const { ctx } = this;
    // if (ctx.session.user.role < 1) {
    //   ctx.status = 403;
    //   ctx.body = '';
    //   return;
    // }
    // 校验 `ctx.request.body` 是否符合我们预期的格式
    // 如果参数校验未通过，将会抛出一个 status = 422 的异常
    // 调用 service 创建一个 topic
    const operator = ctx.session.user._id;
    const site = await ctx.service.ad.create(Object.assign({}, ctx.request.body, { operator }));
    // 设置响应体和状态码
    ctx.body = {
      status: 0,
      detail: site,
    };
    ctx.status = 200;
  }

  async destroy() {
    const { ctx } = this;
    if (ctx.session.user.role < 1) {
      ctx.status = 403;
      ctx.body = '';
      return;
    }
    await ctx.service.ad.delete(ctx.params.id);
    ctx.body = {
      status: 1,
      detail: '删除成功',
    };
  }

  async update() {
    const { ctx } = this;
    await ctx.service.ad.update(ctx.params.id, ctx.request.body);
    ctx.body = {
      status: 1,
      detail: '更新成功',
    };
  }

  async index() {
    const { ctx } = this;
    const { imgHeight, imgHeightOmg, imgWidth, imgWidthOmg, textMin, textMax, textOmg, type } = ctx.query;
    const query = _.clone(ctx.request.query);
    if (+imgHeight && (imgHeightOmg === 'false')) {
      query.imgHeight = imgHeight;
    } else {
      delete query.imgHeight;
      delete query.imgHeightOmg;
    }

    if (+imgWidth && (imgWidthOmg === 'false')) {
      query.imgWidth = imgWidth;
    } else {
      delete query.imgWidth;
      delete query.imgHeightOmg;
    }


    if (type && (type !== 'mixin')) {
      query.type = type;
    } else {
      delete query.type;
    }

    if (textOmg === 'false') {
      query.textMin = textMin;
      query.textMax = textMax;
    } else {
      delete query.textMin;
      delete query.textMax;
    }

    const detail = await ctx.service.ad.list(query);
    ctx.body = {
      status: 0,
      detail,
    };
  }
}
module.exports = AdController;
