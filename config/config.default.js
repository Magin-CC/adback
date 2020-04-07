'use strict';

module.exports = appInfo => {
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1535945256182_9600';

  // add your config here
  config.middleware = [ 'errorHandler' ];

  config.errorHandler = {
    match: '/api',
  };

  config.mongoose = {
    url: 'mongodb://127.0.0.1:12345/adSystem',
    options: {},
  };

  config.session = {
    renew: true,
  };

  config.security = {
    csrf: {
      enable: false,
      ignoreJSON: true,
    },
  };
  config.static = {
    maxAge: 31536000,
  };
  config.bodyParser = {
    jsonLimit: '1000mb',
    formLimit: '1000mb',
  };
  config.multipart = {
    fileSize: '10000mb',
    whitelist: [
      '.pdf',
      '.jpg', '.jpeg', // image/jpeg
      '.png', // image/png, image/x-png
      '.gif', // image/gif
      '.bmp', // image/bmp
      '.wbmp', // image/vnd.wap.wbmp
    ],
  };
  config.static = {
    prefix: '/ad/public',
  };

  // config.email = {
  //   username: 'wlyyconfluence@163.com',
  //   password: 'wlyy123456',
  //   host: 'smtp.163.com',
  //   sender: 'wlyyconfluence@163.com',
  // };
  config.email = {
    username: 'wangchao1',
    // password: 'KyT2GIxE2WypRaxN',
    password: 'wangchao931124',
    host: 'smtp.8531.cn',
    sender: 'wangchao1',
  };

  config.redis = {
    client: {
      host: '127.0.0.1',
      port: '6379',
      password: '',
      db: 4,
    },
    agent: true,
  };

  config.session = {
    key: 'AD_SYS',
    maxAge: 24 * 3600 * 1000, // 1 天
    httpOnly: true,
    encrypt: true,
  };

  // config.sessionRedis = {
  //   name: 'AD_SYS_SEESION', // specific instance `session` as the session store
  // };
  return config;
};
