'use strict';

const Controller = require('egg').Controller;
class AdslotController extends Controller {
  async create() {
    const ctx = this.ctx;
    // 校验 `ctx.request.body` 是否符合我们预期的格式
    // 如果参数校验未通过，将会抛出一个 status = 422 的异常
    // 调用 service 创建一个 topic
    const operator = ctx.session.user._id;
    const site = await ctx.service.adslot.create(Object.assign({}, ctx.request.body, {
      operator, ads: [{
        name: '默认槽位',
        index: 0,
      }],
    }));
    // 设置响应体和状态码
    ctx.body = {
      status: 0,
      detail: site,
    };
    ctx.status = 200;
  }

  async destroy() {
    const { ctx } = this;
    const data = await ctx.service.adslot.delete(ctx.params.id);
    ctx.body = {
      status: 1,
      detail: '删除成功',
    };
  }

  async update() {
    const { ctx } = this;
    const data = await ctx.service.adslot.update(ctx.params.id, Object.assign({}, ctx.request.body, { updater: ctx.session.user._id }));
    ctx.body = {
      status: 1,
      detail: '更新成功',
      res: data,
    };
  }

  async index() {
    const { ctx } = this;
    const detail = await ctx.service.adslot.list(ctx.request.query);
    ctx.body = {
      status: 0,
      detail,
    };
  }
}
module.exports = AdslotController;
