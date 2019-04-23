'use strict';

module.exports = app => {
  const mongoose = app.mongoose,
    Schema = mongoose.Schema;
  const OrderSchema = new Schema({
    adslot: { type: mongoose.Schema.ObjectId, ref: 'Adslot' },
    slot: Number,
    ad: { type: mongoose.Schema.ObjectId, ref: 'Ad' },
    operator: { type: Schema.ObjectId, ref: 'User' },
    contract: { type: String }, // 合同编号
    status: Number, // 0未审核  1审核通过 2审核不通过
    startDate: { type: Date },
    endDate: { type: Date },
    updateDate: { type: Date },
    createDate: { type: Date },
    visited: { type: Number, default: 0 }, // 访问次数
  });
  return mongoose.model('Order', OrderSchema);
};
