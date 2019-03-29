'use strict';
module.exports = () => {
  return async function authCheck(ctx, next) {
    if (ctx.session.user && ctx.session.user._id) {
      await next();
    } else {
      ctx.body = { status: -1, detail: '未登录' };
      ctx.status = 401;
    }
  };
};
