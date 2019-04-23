'use strict';

module.exports = app => {
  const mongoose = app.mongoose,
    Schema = mongoose.Schema;

  const VisitSchema = new Schema({
    ip: String,
    origin: String,
    createDate: Date,
    order: { type: mongoose.Schema.ObjectId, ref: 'Order' },
    site: { type: mongoose.Schema.ObjectId, ref: 'Site' },
  });
  return mongoose.model('Visit', VisitSchema);
};
