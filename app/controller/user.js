'use strict';

const Controller = require('egg').Controller;
const svgCaptcha = require('svg-captcha');
const crypto = require('crypto');

const loginRule = {
  username: 'string',
  password: 'string',
  captcha: 'string',
};
const CAPTCHA_OPTIONS = {
  width: 100,
  height: 40, // height of captcha
  fontSize: 50, // captcha text size
  color: true,
  noise: 4,
};

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
    const _pwd = data.password;
    data.password = crypto.createHash('md5').update(_pwd).digest('hex');
    await ctx.service.user.create(data);

    try {
      await app.email.sendEmail('【网络医院广告系统】账号申请成功',
        `账号：${data.username}\n密码：${data._pwd}\n登录系统后请修改密码！`,
        data.email);
    } catch (e) {
      ctx.logger.error(e);
    }
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
    if (ctx.session.user.role !== 2) {
      ctx.status = 403;
      ctx.body = '';
      return;
    }
    const users = await ctx.service.user.list(ctx.request.query);
    ctx.body = {
      status: 0,
      detail: users,
    };
  }

  async login() {
    const { ctx, service, app } = this;
    const { username, password, captcha } = ctx.request.body;
    ctx.validate(loginRule, ctx.request.body);
    const redisK = ctx.cookies.get('LOGIN_CAPTCHA');
    const redisV = await app.redis.get(redisK);
    if (!redisV) {
      return ctx.fail(-1, '验证码已过期');
    }
    await app.redis.del(redisK);
    if (captcha !== redisV) {
      return ctx.fail(-1, '验证码错误');
    }
    const user = await service.user.checkUser(username, password);
    delete user.password;
    ctx.session.user = user;
    ctx.body = {
      status: 0,
      detail: user,
    };
  }

  async loginCaptcha() {
    const { ctx, app } = this;
    const captcha = svgCaptcha.createMathExpr(CAPTCHA_OPTIONS);
    const redisKey = `LOGIN_CAPTCHA_${(new Date().valueOf().toString())
      .slice(-5)}_${Math.random().toString().slice(5)}`;
    await app.redis.set(redisKey, captcha.text, 'EX', 10 * 60);
    ctx.cookies.set('LOGIN_CAPTCHA', redisKey);
    ctx.success(captcha.data);
  }
}
module.exports = UserController;
