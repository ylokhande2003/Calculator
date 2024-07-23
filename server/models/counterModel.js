// models/counterModel.js
const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Name of the counter, e.g., 'calculator_log_id'
  sequence_value: { type: Number, default: 0 }
});

module.exports = mongoose.model('Counter', counterSchema);
