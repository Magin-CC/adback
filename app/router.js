'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller, middleware } = app;
  const authCheck = middleware.authCheck(0);
  // const devCheck = middleware.authCheck(1);
  // const rootCheck = middleware.authCheck(2);

  router.get('/', controller.home.index);

  router.get('/ad/adHtml/:id', controller.home.script);
  router.get('/ad/adJson/:id', controller.home.scriptByData);
  router.get('/ad/visit/:id', controller.home.visit);

  router.post('/ad/api/v1/login', controller.user.login);
  router.get('/ad/api/v1/loginCaptcha', controller.user.loginCaptcha);
  router.post('/ad/api/v1/upload', authCheck, controller.home.upload);
  app.router.resources('user', '/ad/api/v1/user', authCheck, app.controller.user);
  app.router.resources('site', '/ad/api/v1/site', authCheck, app.controller.site);
  app.router.resources('ad', '/ad/api/v1/ad', authCheck, app.controller.ad);
  app.router.resources('adslot', '/ad/api/v1/adslot', authCheck, app.controller.adslot);
  app.router.resources('visit', '/ad/api/v1/visit', authCheck, app.controller.visit);
  app.router.resources('order', '/ad/api/v1/order', authCheck, app.controller.order);
  app.router.resources('contract', '/ad/api/v1/contract', authCheck, app.controller.contract);
  app.router.post('/ad/api/v1/contract_create', controller.contract._create);
  app.router.get('total', '/ad/api/v1/total', authCheck, app.controller.home.total);
  // app.router.get('script', '/ad/:id', )
};
