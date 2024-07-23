// utils/getNextSequenceValue.js
const Counter = require('../models/counterModel');

const getNextSequenceValue = async (counterName) => {
  const counter = await Counter.findByIdAndUpdate(
    counterName,
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true }
  );
  return counter.sequence_value;
};

module.exports = getNextSequenceValue;
