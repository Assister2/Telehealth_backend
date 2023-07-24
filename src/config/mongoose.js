const mongoose = require('mongoose');
const mongodb = require('mongodb');
const logger = require('./logger');
const { mongo, env } = require('./vars');
const multer = require("multer")
const { GridFsStorage } = require("multer-gridfs-storage")
require("dotenv").config()
const MongoClient = require("mongodb").MongoClient
const GridFSBucket = require("mongodb").GridFSBucket

const mongoURI = process.env.MONGO_URI;



// set mongoose Promise to Bluebird
mongoose.Promise = Promise;

// Exit application on error
mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB connection error: ${err}`);
  process.exit(-1);
});

const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    //If it is an image, save to photos bucket
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      return {
        bucketName: "photos",
        filename: `${Date.now()}_${file.originalname}`,
      }
    } else {
      //Otherwise save to default bucket
      return `${Date.now()}_${file.originalname}`
    }
  },
});

const upload = multer({ storage });

exports.upload = upload;

// print mongoose logs in dev env
if (env === 'development') {
  mongoose.set('debug', true);
}

/**
 * Connect to mongo db
 *
 * @returns {object} Mongoose connection
 * @public
 */
exports.connect = async () => {
  await mongoose
    .connect(mongo.uri, {
      useCreateIndex: true,
      keepAlive: 1,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    })
    .then(() => console.log('mongoDB connected...'));
  return mongoose.connection;
};