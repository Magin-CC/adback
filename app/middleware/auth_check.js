'use strict';
module.exports = role => {
  if (!role) {
    role = 0;
  }
  return async function authCheck(ctx, next) {
    if (ctx.session.user && ctx.session.user._id) {
      if (ctx.session.user.role >= role) {
        await next();
      } else {
        ctx.body = { status: -1, detail: '用户权限不足' };
        ctx.status = 401;
      }
    } else {
      ctx.body = { status: -1, detail: '未登录' };
      ctx.status = 401;
    }
  };
};
