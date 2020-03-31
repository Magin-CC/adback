'use strict';
const Controller = require('egg').Controller;
const pump = require('mz-modules/pump');
const path = require('path');
const fs = require('fs');
const sendToWormhole = require('stream-wormhole');
const _ = require('lodash');

class ContractController extends Controller {
  constructor(props) {
    super(props);
    this.contractPwd = this.ctx.app.config.env === 'prod' ? path.join('/', 'home', 'upload', 'contract') : path.join(this.config.baseDir, 'app/public/contract/');
    this.schedulePwd = this.ctx.app.config.env === 'prod' ? path.join('/', 'home', 'upload', 'schedule') : path.join(this.config.baseDir, 'app/public/schedule/');
  }
  async index() {
    const { ctx } = this;
    const res = await ctx.service.contract.list(ctx.queries);
    ctx.helper.successRes(res);
  }
  async create() {
    const { ctx } = this;

    const parts = ctx.multipart();
    let part,
      number,
      contractName,
      scheduleName;

    const contractContent = {};

    while ((part = await parts()) != null) {
      if (part.length) {
        // 这是 busboy 的字段
        console.log('field: ' + part[0]);
        console.log('value: ' + part[1]);
        console.log('valueTruncated: ' + part[2]);
        console.log('fieldnameTruncated: ' + part[3]);
      } else {
        if (!part.filename) {
          console.log(part);
          return;
        }
        let filename = part.filename;

        if (part.fieldname === 'contract') {
          const filenameChunk = filename.split('-');
          number = filenameChunk[0];
          filenameChunk.splice(1, 0,
            (new Date()).valueOf().toString()
              .slice(-4));
          filename = filenameChunk.join('-');
          const target = path.join(this.contractPwd, filename);
          const targetStream = fs.createWriteStream(target);
          await pump(part, targetStream);
          contractName = filename;
        } else if (part.fieldname === 'schedule') {
          filename = (new Date()).valueOf() + '-' + filename;
          const target = path.join(this.schedulePwd, filename);
          const targetStream = fs.createWriteStream(target);
          await pump(part, targetStream);
          scheduleName = filename;
          const res = await this.app.ocr(target);
          if (res.words_result) {
            const words = _.map(res.words_result, v => v.words);
            console.log(words);
            _.forEach(words, v => {
              if (v.includes('日期:')) {
                contractContent.date = v.slice(3, 11);
              }
              if (v.includes('合同名称:')) {
                const _d = v.split('合同名称:');
                contractContent.title = _d[_d.length - 1];
              }
              if (v.includes('申请部门及经办人:')) {
                const _d = v.split('申请部门及经办人:');
                contractContent.operator = _d[_d.length - 1];
              }
              if (v.includes('甲方:')) {
                const _d = v.split('甲方:');
                contractContent.from = _d[_d.length - 1];
              }
              if (v.includes('乙方:')) {
                const _d = v.split('乙方:');
                contractContent.to = _d[_d.length - 1];
              }
              if (v.includes('合同履行期限:')) {
                const _d = v.split('合同履行期限:');
                contractContent.drution = _d[_d.length - 1];
              }
            });
          }
        }
      }
      sendToWormhole(part);
    }

    const data = {
      number,
      contractName,
      scheduleName,
      contractContent,
    };
    // const res = await ctx.service.contract.create(data);
    ctx.helper.successRes(data);
  }
  async _create() {
    const { ctx } = this;
    const { body } = ctx.request;
    console.log(body);
    await ctx.service.contract.create(body);
    ctx.helper.successRes('上传成功', 1);
  }
}
module.exports = ContractController;
