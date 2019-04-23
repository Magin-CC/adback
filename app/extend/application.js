'use strict';
const AipOcrClient = require('baidu-aip-sdk').ocr;
const fs = require('fs');

module.exports = {
  ocr(filePath) {
    const BAIDU_APP_ID = '16075601';
    const BAIDU_API_KEY = 'ijBFHs3DlGwi60fc8L0jrwsQ';
    const SECRET_KEY = '8abKGKCETj5QV62on35NaS5olHiYjvWb';
    const client = new AipOcrClient(BAIDU_APP_ID, BAIDU_API_KEY, SECRET_KEY);
    const image = fs.readFileSync(filePath).toString('base64');
    return client.generalBasic(image, { detect_direction: true });
  },
};
