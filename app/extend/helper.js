'use strict';
const imageSize = require('image-size');
const path = require('path');
const moment = require('moment');

module.exports = {
  getImageSize(imgUrl) {
    const target = path.join('app/public', imgUrl);
    const size = imageSize(target);
    const data = {};
    data.width = size.width;
    data.height = size.height;
    return data;
  },
  successRes(detail, status, data) {
    const { ctx } = this;
    ctx.status = 200;
    ctx.body = { status: status || 0, data, detail };
  },
  failRes(data, detail, code, status) {
    const { ctx } = this;
    ctx.status = status || 500;
    ctx.body = { status: code, data, detail };
  },
  getOrderText(orderRes) {
    const text = `
    广告名称：${orderRes.ad.name}
    广告位名称：${orderRes.adslot.name}
    槽位：${orderRes.adslot.ads[orderRes.slot].name}(${orderRes.slot}号槽位)
    上架时间：${moment(orderRes.startDate).format('YYYY-MM-DD')} - ${moment(orderRes.endDate).format('YYYY-MM-DD')}
    合同编号：${orderRes.contract}
    `;
    return text;
  },
};
