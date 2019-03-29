'use strict';

module.exports = app => {
  const mongoose = app.mongoose,
    Schema = mongoose.Schema;
  const AdSchema = new Schema({
    ad: { type: mongoose.Schema.ObjectId, ref: 'Ad' },
    isDefault: { type: Boolean, default: false },
    startDate: Date,
    endDate: Date,
  });
  const slotSchema = new Schema({
    index: Number,
    name: String,
    ads: [ AdSchema ],
  });
  const AdslotSchema = new Schema({
    name: { type: String, unique: true },
    operator: { type: mongoose.Schema.ObjectId, ref: 'User' },
    updater: { type: mongoose.Schema.ObjectId, ref: 'User' },
    site: { type: mongoose.Schema.ObjectId, ref: 'Site' },
    type: { type: String }, // image, text, mixin
    ads: [ slotSchema ],
    defaultAd: { type: mongoose.Schema.ObjectId, ref: 'Ad' },
    script: { type: String },
    scriptHistory: { type: String },
    createDate: { type: Date },
    description: { type: String },
  });
  return mongoose.model('Adslot', AdslotSchema);
};
