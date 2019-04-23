'use strict';

module.exports = app => {
  const mongoose = app.mongoose,
    Schema = mongoose.Schema;
  const AdSchema = new Schema({
    ad: { type: mongoose.Schema.ObjectId, ref: 'Ad' },
    isDefault: { type: Boolean, default: false },
    startDate: Date,
    endDate: Date,
    order: { type: mongoose.Schema.ObjectId, ref: 'Order' },
  });
  const SlotSchema = new Schema({
    index: Number,
    name: String,
    ads: [ AdSchema ],
  });
  const SizeSchema = new Schema({
    imgHeight: Number,
    imgHeightOmg: Boolean,
    imgWidth: Number,
    imgWidthOmg: Boolean,
    textMax: Number,
    textMin: Number,
    textOmg: Boolean,
  });
  const AdslotSchema = new Schema({
    name: { type: String, unique: true },
    operator: { type: mongoose.Schema.ObjectId, ref: 'User' },
    updater: { type: mongoose.Schema.ObjectId, ref: 'User' },
    site: { type: mongoose.Schema.ObjectId, ref: 'Site' },
    type: { type: String }, // image, text, mixin
    ads: [ SlotSchema ],
    defaultAd: { type: mongoose.Schema.ObjectId, ref: 'Ad' },
    script: { type: String },
    scriptHistory: { type: String },
    createDate: { type: Date },
    description: { type: String },
    size: SizeSchema,
  });
  AdslotSchema.set('toObject', { getters: true });
  return mongoose.model('Adslot', AdslotSchema);
};
