const mongoose = require('mongoose');
const httpStatus = require('http-status');
// let gfs;

// mongoose.connection.once('open', () => {
//   gfs = new Grid(mongoose.connection.db, mongoose.mongo);
//   gfs.collection('photos');
// })

/**
 * User Schema
 * @private
 */
const scheduleSchema = new mongoose.Schema({
  weekday: {
    type: String,
    required: true,
  },
  slots: [
    {
      startTime: {
        type: String,
        required: true,
      },
      endTime: {
        type: String,
        required: true,
      },
    },
  ],
});
  /**
 * @typedef Schedule
 */
module.exports = mongoose.model('Schedule', scheduleSchema);