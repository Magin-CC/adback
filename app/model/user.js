'use strict';

module.exports = app => {
  const mongoose = app.mongoose,
    Schema = mongoose.Schema;

  const UserSchema = new Schema({
    username: { type: String, unique: true },
    password: { type: String },
    role: { type: Number, default: 0 }, // 0普通用户； 1开发者； 2超管
    allow: { type: Boolean, default: true }, // 是否允许登录
    createDate: { type: Date },
    email: { type: String, unique: true },
  });
  return mongoose.model('User', UserSchema);
};
