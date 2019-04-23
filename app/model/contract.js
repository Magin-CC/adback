'use strict';

module.exports = app => {
  const mongoose = app.mongoose,
    Schema = mongoose.Schema;

  const ContractContent = new Schema({
    date: String,
    drution: String,
    from: String,
    operator: String,
    title: String,
    to: String,
  });
  const ContractSchema = new Schema({
    number: String,
    contractName: String,
    scheduleName: String,
    contractContent: ContractContent,
    createDate: Date,
    operator: { type: mongoose.Schema.ObjectId, ref: 'User' },
  });
  return mongoose.model('Contract', ContractSchema);
};
