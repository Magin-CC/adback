'use strict';

const Controller = require('egg').Controller;
class AdController extends Controller {
  async create() {
    const ctx = this.ctx;
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
    const data = await ctx.service.ad.delete(ctx.params.id);
    ctx.body = {
      status: 1,
      detail: '删除成功',
    };
  }

  async update() {
    const { ctx } = this;
    const data = await ctx.service.ad.update(ctx.params.id, ctx.request.body);
    ctx.body = {
      status: 1,
      detail: '更新成功',
    };
  }

  async index() {
    const { ctx } = this;
    const detail = await ctx.service.ad.list(ctx.request.query);
    ctx.body = {
      status: 0,
      detail,
    };
  }
}
module.exports = AdController;
