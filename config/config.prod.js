'use strict';

module.exports = () => {
  const config = exports = {};
  config.alinode = {
    server: 'wss://agentserver.node.aliyun.com:8080',
    appid: '76198',
    secret: '2d2a98dc519320578a57bf9569045e2389ee60e6',
    logdir: '/tmp/',
  };
  return config;
};
