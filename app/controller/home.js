'use strict';

const Controller = require('egg').Controller;
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const pump = require('mz-modules/pump');
const imageSize = require('image-size');

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
    const target = path.join(this.config.baseDir, 'app/public', filename);
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
      const now = new Date();
      adSlotItem.ads.forEach((v, k) => {
        if (now > v.startDate && now < v.endDate && (!showAd._id) && v.ad) {
          showAd = v.ad;
        }
      });
      // 不存在广告，使用默认广告
      if (!showAd._id && adslot.defaultAd) {
        showAd = adslot.defaultAd;
      }
      if (showAd.type === 'text') {
        return `<span style='cursor:pointer' onclick='fetch(\\"${this.baseUrl + '/ad/visit/' + showAd._id}\\");window.open(\\"${showAd.link} \\")'>${showAd.text}</span>`;
      } else if (showAd.type === 'image') {
        return `<img src='${this.baseUrl + showAd.image.thumbUrl}' style='width:100%;cursor:pointer' onclick='window.open(\\"${showAd.link} \\"); fetch(\\"${this.baseUrl + '/ad/visit/' + showAd._id + '?site=' + adslot.site}\\");' />`;
      }
      noAd++;
      return '';
    };
    script = script.replace(/\r\n/g, ' ').replace(/\n/g, ' ');
    const ads = script.replace(/\<\%.*?\%\>/g, (match, key, value) => {
      const adIndex = match.replace(/\<\%/, '').replace(/\%\>/, '');
      if (isNaN(+adIndex)) {
        // 如果模板内出现关键字 'all', 则认为是遍历所有槽位
        if (adIndex.includes('all')) {
          return adslot.ads.map((v, k) => {
            return getIndexSlot(k) ?
              adIndex
                // 将all替换为 k槽位的广告
                .replace(/all/g, getIndexSlot(k))
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
      for (let kk = 0; kk < v.ads.length; kk++) {
        if (now > v.ads[kk].startDate && now < v.ads[kk].endDate) {
          v.ad = v.ads[kk].ad;
          break;
        }
      }
      if (!v.ad) {
        v.ad = defaultAd;
      }
      if (v.ad) {
        if (v.ad.type === 'image') {
          v.ad = Object.assign({}, { image: this.baseUrl + v.ad.image.thumbUrl }, { link: v.ad.link }, { visit: this.baseUrl + '/ad/visit/' + v.ad._id });
        } else {
          v.ad = Object.assign({}, { text: v.ad.text }, { link: v.ad.link }, { visit: this.baseUrl + '/ad/visit/' + v.ad._id });
        }
        delete v.ads;
      } else {
        delete ads[k];
      }
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
    const data = await service.visit.create({
      ip: ctx.request.header['x-forwarded-for'],
      origin: ctx.request.header.referer,
      ad: id,
      site: ctx.request.query.site,
    });
    const data2 = await service.ad.incVisit(id, 1);
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
