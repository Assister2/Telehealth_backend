const httpStatus = require('http-status');
const { omit } = require('lodash');
const Speciality = require('../models/speciality.model');

/**
 * Get Specialist list
 * @public
 */
exports.list = async (req, res, next) => {
    try {
        const specialities = await Speciality.list();
        console.log('333333333', specialities)
        res.json(specialities)
    } catch (error) {
        next(error);
    }
}