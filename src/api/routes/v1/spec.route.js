const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/spec.controller');
const { authorize, ADMIN, LOGGED_USER } = require('../../middlewares/auth');
// const {
//     listSpecs
// } = require('../../validations/spec.validation');

const router = express.Router();

router
    .route('/')
    .get(controller.list);

module.exports = router;
