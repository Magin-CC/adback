'use strict';

module.exports = app => {
  const mongoose = app.mongoose,
    Schema = mongoose.Schema;

  const VisitSchema = new Schema({
    ip: String,
    origin: String,
    createDate: Date,
    ad: { type: mongoose.Schema.ObjectId, ref: 'Ad' },
    site: { type: mongoose.Schema.ObjectId, ref: 'Site' },
  });
  return mongoose.model('Visit', VisitSchema);
};
