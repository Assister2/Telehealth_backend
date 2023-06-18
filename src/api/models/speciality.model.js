const mongoose = require('mongoose');

const specSchema = new mongoose.Schema({
    speciality: { type: String },   
})

specSchema.statics = {
    list() {
        return this.find();
    }
}

/**
 * @typedef User
 */

module.exports = mongoose.model('Speciality', specSchema);