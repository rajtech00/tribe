const ErrorResponse = require('../utils/errorResponse.util');
const asyncHandler = require('../middlewares/asyncHandler.middleware');
const sgMail = require('@sendgrid/mail');
const User = require('../model/user.model');

sgMail.setApiKey(process.env.SEND_GRID_API);

exports.signUp = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  //Create users
  const user = await User.create({
    name,
    email,
    password,
  });
  const result = sendToken(user);
  if (result.success) {
    try {
      const message = `Hello ${name}, you have signed up successfully`;
      const msg = {
        to: email,
        from: 'awoldahaka@gmail.com',
        subject: 'successfully signed up',
        text: message,
      };
      await sgMail.send(msg);
      res.status(200).cookie('token', result.token, result.options).json({
        success: true,
      });
    } catch (err) {
      console.log(err);
      return next(new ErrorResponse('Email could not be sent', 500));
    }
  }
});

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  //Validate email and password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid credential', 401));
  }

  //check if password matches
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new ErrorResponse('Invalid credential', 401));
  }
  const result = sendToken(user);
  if (result.success) {
    const token = result.token;
    res.status(200).cookie('token', result.token, result.options).json({
      success: true,
      token,
    });
  } else {
    return next(new ErrorResponse('Internal error', 400));
  }
});

const sendToken = (user) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  return { success: true, token: token, options: options };
};
