'use strict';

// had enabled by egg
// exports.static = true;
exports.validate = {
  enable: true,
  package: 'egg-validate',
};
exports.mongoose = {
  enable: true,
  package: 'egg-mongoose',
};
exports.email = {
  enable: true,
  package: 'egg-mail',
};
exports.redis = {
  enable: true,
  package: 'egg-redis',
};
exports.sessionRedis = {
  enable: true,
  package: 'egg-session-redis',
};
