const mongoose = require('mongoose');

const calculatorLogSchema = new mongoose.Schema({
  _id: { type: Number, required: true },
  expression: { type: String, required: true },
  is_valid: { type: Boolean, required: true },
  output: { type: Number, default: null },
  created_on: { type: Date, default: Date.now }
});

const CalculatorLog = mongoose.model('CalculatorLog', calculatorLogSchema);

module.exports = CalculatorLog;
