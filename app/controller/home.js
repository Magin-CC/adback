'use strict';

const Controller = require('egg').Controller;
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const pump = require('mz-modules/pump');
const _ = require('lodash');

const loginRule = {
  username: 'string',
  password: 'string',
};
class HomeController extends Controller {
  constructor(props) {
    super(props);
    this.baseUrl = this.ctx.app.config.env === 'prod' ?
      'https://guahao.zjol.com.cn' : 'http://localhost:7001';
    this.uploadPwd = this.ctx.app.config.env === 'prod' ? path.join('/', 'home', 'upload') : path.join(this.config.baseDir, 'app/public');
  }
  async index() {
    this.ctx.body = 'hi, egg';
  }
  async login() {
    const { ctx, service } = this;
    const { username, password } = ctx.request.body;
    ctx.validate(loginRule, ctx.request.body);
    const user = await service.user.checkUser(username, password);
    delete user.password;
    ctx.session.user = user;
    ctx.body = {
      status: 0,
      detail: user,
    };
  }
  async upload() {
    const stream = await this.ctx.getFileStream();
    const filename = (new Date()).valueOf() + '.jpg';
    const target = path.join(this.uploadPwd, filename);
    const writeStream = fs.createWriteStream(target);
    await pump(stream, writeStream);
    // const size = this.ctx.helper.getImageSize(filename);
    this.ctx.body = { status: 0, message: filename /** size */ };
  }
  async script() {
    const { ctx, service } = this;
    const { id } = ctx.params;
    const adslot = await service.adslot.findOne(id);
    let noAd = 0; // 无广告的广告位的数量，当noAd === 广告位数量时，输出空字符串
    let { script } = adslot;
    const getIndexSlot = index => {
      const adSlotItem = adslot.ads[index];
      if (!adSlotItem) {
        return '';
      }
      let showAd = {};
      let showOrderId = '';
      const now = new Date();
      _.forEach(adSlotItem.ads, v => {
        if (now > v.startDate && now < v.endDate && (!showAd._id) && v.ad) {
          showAd = v.ad;
          showOrderId = v.order;
          return false;
        }
      });
      // 不存在广告，使用默认广告
      if (!showAd._id && adslot.defaultAd) {
        showAd = adslot.defaultAd;
      }
      if (showAd.type === 'text') {
        return `<span style='cursor:pointer' onclick='fetch(\\"${this.baseUrl + '/ad/visit/' + showOrderId}\\");window.open(\\"${showAd.link} \\")'>${showAd.text}</span>`;
      } else if (showAd.type === 'image') {
        return `<img src='${this.baseUrl + showAd.image.thumbUrl}' style='width:100%;cursor:pointer' onclick='window.open(\\"${showAd.link} \\"); fetch(\\"${this.baseUrl + '/ad/visit/' + showOrderId + '?site=' + adslot.site}\\");' />`;
      }
      noAd++;
      return '';
    };
    script = script.replace(/\r\n/g, ' ').replace(/\n/g, ' ');
    const ads = script.replace(/\<\%.*?\%\>/g, match => {
      const adIndex = match.replace(/\<\%/, '').replace(/\%\>/, '');
      if (isNaN(+adIndex)) {
        // 如果模板内出现关键字 'ALL', 则认为是遍历所有槽位
        if (adIndex.includes('ALL')) {
          return adslot.ads.map((v, k) => {
            return getIndexSlot(k) ?
              adIndex
                // 将all替换为 k槽位的广告
                .replace(/ALL/g, getIndexSlot(k))
                // 将 NAME 替换为 k槽位的名称
                .replace(/NAME/g, v.name)
                // 将 INDEX 替换为 k槽位的序号
                .replace(/INDEX/g, v.index)
              :
              '';
          }).join('');
        } else if (_.isNumber(+adIndex.split('.')[0])) {
          return adslot.ads[+adIndex.split('.')[0]][adIndex.split('.')[1]];
        }
        return '';
      }
      return getIndexSlot(adIndex);
    });
    ctx.body = noAd === adslot.ads.length ? '' : `(function(){
      const signTime=(new Date()).valueOf();
      ${ads}
    }())`;
    ctx.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Expose-Headers': '*',
      'Cache-Control': 'no-cache',
    });
    ctx.set('content-type', 'application/x-javascript;charset=UTF-8');
  }
  async scriptByData() {
    const { ctx, service } = this;
    const { id } = ctx.params;
    const adslot = await service.adslot.findOne(id);
    let { ads, defaultAd } = adslot.toJSON();
    const now = new Date();
    ads.forEach((v, k) => {
      let checkAd = {};
      _.forEach(v.ads || [], vv => {
        if (now > vv.startDate && now < vv.endDate) {
          checkAd = _.cloneDeep(vv);
          return false;
        }
      });
      if (!checkAd.ad) {
        checkAd.ad = defaultAd;
      }
      console.log(checkAd);
      if (checkAd.ad) {
        if (checkAd.ad.type === 'image') {
          checkAd.ad = Object.assign({}, { image: this.baseUrl + checkAd.ad.image.thumbUrl }, { link: checkAd.ad.link }, { visit: this.baseUrl + '/ad/visit/' + checkAd.order });
        } else {
          checkAd.ad = Object.assign({}, { text: checkAd.ad.text }, { link: checkAd.ad.link }, { visit: this.baseUrl + '/ad/visit/' + checkAd.order });
        }
        delete v.ads;
      } else {
        delete ads[k];
      }
      v.ad = checkAd.ad;
    });
    ads = ads.filter(v => v);

    ctx.body = {
      status: 0,
      error: false,
      data: ads,
    };
    ctx.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Expose-Headers': '*',
      'Cache-Control': 'no-cache',
    });
  }
  async visit() {
    const { ctx, service } = this;
    const { id } = ctx.params;
    if (id && (id !== 'undefined')) {
      await service.visit.create({
        ip: ctx.request.header['x-forwarded-for'],
        origin: ctx.request.header.referer,
        order: id,
        site: ctx.request.query.site,
      });
      await service.order.incVisit(id, 1);
    }
    ctx.status = 204;
    ctx.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Expose-Headers': '*',
      'Cache-Control': 'no-cache',
    });
  }

  async total() {
    const { ctx, service } = this;
    const siteCount = await service.site.count();
    const adslotCount = await service.adslot.count();
    const adCount = await service.ad.count();
    const visitCount = await service.visit.count('1900-01-01');
    const todayVisitCount = await service.visit.count(moment(moment().format('YYYY-MM-DD')));
    ctx.body = {
      status: 0,
      detail: { siteCount, adslotCount, adCount, visitCount, todayVisitCount },
    };
  }
}

module.exports = HomeController;
