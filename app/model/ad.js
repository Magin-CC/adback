'use strict';

module.exports = app => {
  const mongoose = app.mongoose,
    Schema = mongoose.Schema;
  const ResponseSchema = new Schema({ status: Number, message: String });
  const OriginFileObjSchema = new Schema({ uid: String });
  const ImageSchema = new Schema({
    uid: String,
    lastModified: Number,
    lastModifiedDate: String,
    name: String,
    size: Number,
    type: String,
    percent: Number,
    status: String,
    thumbUrl: String,
    response: ResponseSchema,
    originFileObj: OriginFileObjSchema,
  });
  const ImageSizeSchema = new Schema({
    width: Number,
    height: Number,
  });
  const AdSchema = new Schema({
    name: { type: String, unique: true },
    operator: { type: mongoose.Schema.ObjectId, ref: 'User' },
    adslot: { type: mongoose.Schema.ObjectId, ref: 'Adslot' },
    image: ImageSchema,
    imageSize: ImageSizeSchema,
    text: String,
    link: String,
    type: { type: String }, // image, text, mixin
    updater: { type: mongoose.Schema.ObjectId, ref: 'User' },
    updateDate: { type: Date },
    createDate: { type: Date },
    visited: { type: Number, default: 0 },
  });
  return mongoose.model('Ad', AdSchema);
};
