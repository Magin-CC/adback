'use strict';

const Controller = require('egg').Controller;
class UserController extends Controller {
  async create() {
    const ctx = this.ctx;
    // 校验 `ctx.request.body` 是否符合我们预期的格式
    // 如果参数校验未通过，将会抛出一个 status = 422 的异常
    // 调用 service 创建一个 topic
    const id = await ctx.service.user.create(ctx.request.body);
    // 设置响应体和状态码
    ctx.body = {
      status: 1,
      detail: '新增成功',
    };
  }

  async update() {
    const { ctx } = this;
    const user = await ctx.service.user.update(ctx.params.id, ctx.request.body);
    ctx.body = {
      status: 1,
      detail: '更新成功',
    };
  }

  async index() {
    const { ctx } = this;
    const users = await ctx.service.user.list(ctx.request.query);
    ctx.body = {
      status: 0,
      detail: users,
    };
  }
}
module.exports = UserController;
