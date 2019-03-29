'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller, middleware } = app;
  const authCheck = middleware.authCheck();
  router.get('/', controller.home.index);

  router.get('/ad/adHtml/:id', controller.home.script);
  router.get('/ad/adJson/:id', controller.home.scriptByData);
  router.get('/ad/visit/:id', controller.home.visit);

  router.post('/ad/api/v1/login', controller.home.login);
  router.post('/ad/api/v1/upload', controller.home.upload);
  app.router.resources('user', '/ad/api/v1/user', authCheck, app.controller.user);
  app.router.resources('site', '/ad/api/v1/site', authCheck, app.controller.site);
  app.router.resources('ad', '/ad/api/v1/ad', authCheck, app.controller.ad);
  app.router.resources('adslot', '/ad/api/v1/adslot', authCheck, app.controller.adslot);
  app.router.resources('visit', '/ad/api/v1/visit', authCheck, app.controller.visit);
  app.router.get('total', '/ad/api/v1/total', authCheck, app.controller.home.total);
  // app.router.get('script', '/ad/:id', )
};
