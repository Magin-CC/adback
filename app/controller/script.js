'use strict';

const Controller = require('egg').Controller;
const path = require('path');
const fs = require('fs');
const pump = require('mz-modules/pump');

const loginRule = {
  username: 'string',
  password: 'string',
};

class ScriptController extends Controller {
  async index() {
    this.ctx.body = 'hi, egg';
  }
}

module.exports = ScriptController;
