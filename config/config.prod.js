'use strict';

module.exports = () => {
  const config = exports = {};
  config.alinode = {
    server: 'wss://agentserver.node.aliyun.com:8080',
    appid: '76198',
    secret: '2d2a98dc519320578a57bf9569045e2389ee60e6',
    logdir: '/tmp/',
  };
  config.mongoose = {
    url: 'mongodb://192.168.246.31:27018,192.168.246.31:27019,192.168.246.31:27017/ad_system?replicaSet=replset',
    options: {
      useNewUrlParser: true,
    },
  };
  return config;
};
