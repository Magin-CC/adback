'use strict';

const Controller = require('egg').Controller;
const _ = require('lodash');

class OrderController extends Controller {
  async index() {
    const { ctx, app } = this;
    const res = await ctx.service.order.listOrders(ctx.query);
    ctx.helper.successRes(res);
  }

  async create() {
    const { ctx, app } = this;
    const userInfo = ctx.session.user;
    const res = await ctx.service.order.createOrder(ctx.request.body);
    if (userInfo.email) {
      app.email.sendEmail('【网络医院广告系统】广告已提交',
        '信息：' + ctx.helper.getOrderText(res),
        userInfo.email);
    }
    const adminList = await ctx.service.user.listAdmin();
    _.each(adminList, v => {
      if (v.email) {
        app.email.sendEmail('【网络医院广告系统】收到新的广告上线申请',
          `${userInfo.username} 申请上线：  ${ctx.helper.getOrderText(res)}`,
          v.email);
      }
    });
    ctx.helper.successRes('提交工单成功', 1);
  }

  async new() {
    const { ctx } = this;
    const res = await ctx.service.order.listOrders(_.assign({ operator: ctx.session.user._id }, ctx.query));
    ctx.helper.successRes(res);
  }

  async update() {
    const { ctx, app } = this;
    const { id } = ctx.params;
    const { status } = ctx.request.body;
    const userInfo = ctx.session.user;
    const res = await ctx.service.order.updateOrder(id, status);
    let emailRes;
    if (status === 1) {
      await ctx.service.adslot.setAd(res.adslot, id, res.ad, res.slot, res.startDate, res.endDate);
      if (userInfo.email) {
        emailRes = await app.email.sendEmail('【网络医院广告系统】广告发布成功',
          `${ctx.helper.getOrderText(res)}操作人：${ctx.session.user.username}`,
          userInfo.email);
      }
    } else {
      if (userInfo.email) {
        emailRes = await app.email.sendEmail('【网络医院广告系统】广告审核不通过',
          `${ctx.helper.getOrderText(res)}操作人：${ctx.session.user.username}`,
          userInfo.email);
      }
    }

    if (emailRes && emailRes.code && emailRes.code !== 0) {
      ctx.logger.error(new Error('邮件发送失败:' + emailRes.err));
    }
    console.log(emailRes);
    this.ctx.helper.successRes('工单更新成功', 1);
  }
}

module.exports = OrderController;
