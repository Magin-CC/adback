'use strict';
const _ = require('lodash');
const Service = require('egg').Service;

const createRule = {
  username: 'string',
  password: 'string',
  role: 'number',
};

class UserService extends Service {
  async checkUser(username, password) {
    const { ctx, app } = this;
    const user = await app.model.User.findOne({ username });
    if (!user) {
      await ctx.throw(422, '用户不存在');
    } else if (user.password !== password) {
      await ctx.throw(422, '密码错误');
    } else if (!user.allow) {
      await ctx.throw(422, '账户已被冻结，请联系管理员解除');
    }
    return user.toJSON();
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
    if (_.isNumber(params.role) && (params.role > -1)) {
      query.role = params.role;
    }
    if (params.username) {
      query.username = { $regex: params.username };
    }
    const users = await app.model.User.find(query, { password: 0 }).skip(skip).limit(limit)
      .sort({ [sort]: -1 });
    const count = await app.model.User.count(query);
    return { count, data: users };
  }

  async count() {
    return await this.app.model.User.count();
  }

  async create(params) {
    const { ctx, app } = this;
    ctx.validate(createRule, params);
    const user = await app.model.User.create(Object.assign({}, params, { createDate: new Date() }));
    return user;
  }

  async update(id, params) {
    const { ctx, app } = this;
    const query = {};
    if (params.password) {
      query.password = params.password;
    }
    if (_.isBoolean(params.allow)) {
      query.allow = params.allow;
    }
    if (_.isNumber(params.role)) {
      query.role = params.role;
    }
    const user = await app.model.User.updateOne({ _id: id }, query);
    return user;
  }

  async listAdmin() {
    const res = await this.app.model.User.find({ role: 2 });
    return res;
  }
}

module.exports = UserService;
