// models/calculatorLogModel.js
const mongoose = require('mongoose');
const Counter = require('./counterModel');

const calculatorLogSchema = new mongoose.Schema({
  _id: { type: Number, required: true },
  expression: {
    type: String,
    required: true,
    maxlength: 500
  },
  is_valid: {
    type: Boolean,
    required: true
  },
  output: {
    type: Number,
    required: false
  },
  created_on: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CalculatorLog', calculatorLogSchema);
