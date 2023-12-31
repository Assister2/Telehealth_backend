const httpStatus = require('http-status');
const { ObjectId } = require('mongodb')
const { omit } = require('lodash');
require("dotenv-safe").config()

const User = require('../models/user.model');
const MongoClient = require("mongodb").MongoClient
const mongoose = require('mongoose');
const url = process.env.MONGO_URI

const mongoClient = new MongoClient(url)

/**
 * Load user and append to req.
 * @public
 */
exports.load = async (req, res, next, id) => {
  try {
    const user = await User.get(id);
    req.locals = { user };
    return next();
  } catch (error) {
    return next(error);
  }
};

/**
 * Get user
 * @public
 */
exports.get = (req, res) => res.json(req.locals.user.transform());

/**
 * Get logged in user info
 * @public
 */
exports.loggedIn = async (req, res) => {
  const id = req.user.id;
  const user = await User.findById(id);
  User.getUserProfileWithImages(user.avatar.id)
    .then((userProfileWithImages) => {
      const response = {
        user: user,
        images: userProfileWithImages
      }
      res.json(response);
    })
    .catch((err) => {
      // res.status(500).json({error: 'An error occured'})
    })
};

/**
 * Get logged in user's Schedule
 * @public
 */
exports.getSchedule = async (req, res, next) => {
  try {
    const id = req.user.id;
    const schedules = req.user.schedule;
    res.json(schedules);
  } catch(error){
    next(error);
  }
};



/**
 * Add logged User's Schedule
 * @public 
 */
exports.addSchedule = async (req,res,next) => {
  try{

  } catch(error){

  }
};
/**
 * Create new user
 * @public
 */
exports.create = async (req, res, next) => {
  try {
    const user = new User(req.body);
    const savedUser = await user.save();
    res.status(httpStatus.CREATED);
    res.json(savedUser.transform());
  } catch (error) {
    next(User.checkDuplicateEmail(error));
  }
};

/**
 * Replace existing user
 * @public
 */
exports.replace = async (req, res, next) => {
  try {
    const { user } = req.locals;
    const newUser = new User(req.body);
    const ommitRole = user.role !== 'admin' ? 'role' : '';
    const newUserObject = omit(newUser.toObject(), '_id', ommitRole);

    await user.updateOne(newUserObject, { override: true, upsert: true });
    const savedUser = await User.findById(user._id);

    res.json(savedUser.transform());
  } catch (error) {
    next(User.checkDuplicateEmail(error));
  }
};

/**
 * Update existing user
 * @public
 */
exports.update = async (req, res, next) => {
  // const file = req.file;
  // console.log(222222222, file)
  // const ommitRole = req.locals.user.role !== 'admin' ? 'role' : '';
  // const updatedUser = omit(req.body, ommitRole);
  // const user = Object.assign(req.locals.user, updatedUser);

  // user.save()
  //   .then((savedUser) => res.json(savedUser.transform()))
  //   .catch((e) => next(User.checkDuplicateEmail(e)));
  try {
    console.log(11111)
    const { user } = req.locals;
    const avatar = {
      id: req.file.id,
      filename: req.file.filename
    }
    newUserData = { avatar, ...req.body };
    // console.log(111111, avatar)
    const newUser = new User(newUserData);
    // const ommitRole = user.avatar !== '' ? '' : ;
    // const newUserObject = omit(newUser.toObject(), '_id', ommitRole);

    await user.updateOne(newUserData, { override: true, upsert: true });
    const savedUser = await User.findById(user._id);

    res.json(savedUser.transform());
  } catch (error) {
    next(User.checkDuplicateEmail(error));
  }
};

/**
 * Get user list
 * @public
 */
exports.list = async (req, res, next) => {
  try {
    const users = await User.list(req.query);
    const transformedUsers = users.map((user) => user.transform());
    res.json(transformedUsers);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user
 * @public
 */
exports.remove = (req, res, next) => {
  const { user } = req.locals;

  user.remove()
    .then(() => res.status(httpStatus.NO_CONTENT).end())
    .catch((e) => next(e));
};
