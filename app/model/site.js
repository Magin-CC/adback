'use strict';

module.exports = app => {
  const mongoose = app.mongoose,
    Schema = mongoose.Schema;

  const SiteSchema = new Schema({
    name: { type: String, unique: true },
    operator: { type: mongoose.Schema.ObjectId, ref: 'User' },
    description: String,
    createDate: { type: Date },
  });
  return mongoose.model('Site', SiteSchema);
};
