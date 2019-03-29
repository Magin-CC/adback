'use strict';
const imageSize = require('image-size');
const path = require('path');

module.exports = {
  getImageSize(imgUrl) {
    const target = path.join('app/public', imgUrl);
    const size = imageSize(target);
    const data = {};
    data.width = size.width;
    data.height = size.height;
    return data;
  },
};
