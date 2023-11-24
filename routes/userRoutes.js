import express from 'express';
import User from '../models/user_model.js';
import { getRefreshToken, getToken } from '../utils/auth.js';
import { COOKIE_OPTIONS } from '../utils/auth.js';
import passport from 'passport';

const router = express.Router();

router.post('/signup', async (req, res, next) => {
  try {
    const { username, password, role, companyName, schoolName, email } =
      req.body;

    if (!username || !password || !role || !email) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'Username, password, and role are required fields.',
      });
    }

    const existingUser = await User.findOne({ username });
    const findEmail = await User.findOne({ email });
    const findCompanyName = await User.findOne({ companyName });
    const findSchoolName = await User.findOne({ schoolName });

    if (existingUser) {
      return res.status(400).json({
        error: 'UsernameTaken',
        message:
          'The provided username is already taken. Please choose a different one.',
      });
    }

    if (findEmail) {
      return res.status(400).json({
        error: 'EmailTaken',
        message:
          'The provided email is already taken. Please choose a different one.',
      });
    }

    if (findCompanyName) {
      return res.status(400).json({
        error: 'CompanyNameTaken',
        message:
          'The provided company name is already taken. Please choose a different one.',
      });
    }

    if (findSchoolName) {
      return res.status(400).json({
        error: 'SchoolNameTaken',
        message:
          'The provided school name is already taken. Please choose a different one.',
      });
    }

    const newUser = new User({
      username,
      password,
      role,
      email,
      companyName: role === 'distributor' ? companyName : undefined,
      schoolName: role === 'school' ? schoolName : undefined,
    });

    const registeredUser = await User.register(newUser, password);

    const token = getToken({ _id: registeredUser._id });
    const refreshToken = getRefreshToken({ _id: registeredUser._id });

    registeredUser.refreshToken.push({ refreshToken });

    await registeredUser.save();

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

    res.json({ success: true, token });
  } catch (error) {
    console.error('Error during user registration:', error);
    res
      .status(500)
      .json({ error: 'ServerError', message: 'Internal server error.' });
  }
});

router.post('/login', passport.authenticate('local'), (req, res, next) => {
  const token = getToken({ _id: req.user._id });
  const refreshToken = getRefreshToken({ _id: req.user._id });
  User.findById(req.user._id).then(
    (user) => {
      user.refreshToken.push({ refreshToken });
      user
        .save()
        .then((updatedUser) => {
          res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
          res.send({ success: true, token });
        })
        .catch((err) => {
          res.statusCode = 500;
          res.send(err);
        });
    },
    (err) => next(err),
  );
});

export default router;
