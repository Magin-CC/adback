'use strict';

const Controller = require('egg').Controller;
class UserController extends Controller {
  async create() {
    const { ctx, app } = this;
    // 校验 `ctx.request.body` 是否符合我们预期的格式
    // 如果参数校验未通过，将会抛出一个 status = 422 的异常
    // 调用 service 创建一个 topic
    if (ctx.session.user.role !== 2) {
      ctx.status = 403;
      ctx.body = '';
      return;
    }
    const data = ctx.request.body;
    await ctx.service.user.create(data);
    app.email.sendEmail('【网络医院广告系统】账号申请成功',
      `账号：${data.username}\n密码：${data.password}\n登录系统后请修改密码！`,
      data.email);
    // 设置响应体和状态码
    ctx.body = {
      status: 1,
      detail: '新增成功',
    };
  }

  async update() {
    const { ctx } = this;
    if (ctx.session.user.role !== 2) {
      await ctx.service.user.update(ctx.session.user._id, ctx.request.body);
    } else {
      await ctx.service.user.update(ctx.params.id === '0' ? ctx.session.user._id : ctx.params.id, ctx.request.body);
    }
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
