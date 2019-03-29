'use strict';

const Controller = require('egg').Controller;
class SiteController extends Controller {
  async create() {
    const ctx = this.ctx;
    const operator = ctx.session.user._id;
    const site = await ctx.service.site.create(Object.assign({}, ctx.request.body, { operator }));
    // 设置响应体和状态码
    ctx.body = {
      status: 0,
      detail: site,
    };
    ctx.status = 200;
  }

  async destroy() {
    const { ctx } = this;
    const data = await ctx.service.site.delete(ctx.params.id);
    ctx.body = {
      status: 1,
      detail: '删除成功',
    };
  }

  async index() {
    const { ctx } = this;
    const detail = await ctx.service.site.list(ctx.request.query);
    ctx.body = {
      status: 0,
      detail,
    };
  }
  async update() {
    const { ctx, service } = this;
    const { id } = ctx.params;
    const params = {};
    if (ctx.request.body.name) {
      params.name = ctx.request.body.name;
    }
    if (ctx.request.body.description) {
      params.description = ctx.request.body.description;
    }
    if (!Object.keys(params)) {
      ctx.body = { status: -1, detail: '没有做修改' };
    }
    const data = await service.site.update(id, params);
    ctx.body = {
      status: 1,
      detail: '修改成功',
      data,
    };
  }
}
module.exports = SiteController;
