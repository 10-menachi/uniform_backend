import express from 'express';
import User from '../models/user_model.js';
import { getRefreshToken, getToken } from '../utils/auth.js';
import { COOKIE_OPTIONS } from '../utils/auth.js';
import passport from 'passport';
import jwt from 'jsonwebtoken';

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

    if (existingUser || findEmail || findCompanyName || findSchoolName) {
      const errorType = existingUser
        ? 'UsernameTaken'
        : findEmail
        ? 'EmailTaken'
        : findCompanyName
        ? 'CompanyNameTaken'
        : 'SchoolNameTaken';

      return res.status(400).json({
        error: errorType,
        message: `The provided ${
          errorType === 'UsernameTaken' ? 'username' : errorType.toLowerCase()
        } is already taken. Please choose a different one.`,
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

router.post(
  '/login',
  passport.authenticate('local'),
  async (req, res, next) => {
    try {
      const token = getToken({ _id: req.user._id });
      const refreshToken = getRefreshToken({ _id: req.user._id });

      const user = await User.findById(req.user._id);

      user.refreshToken.push({ refreshToken });

      await user.save();

      res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
      res.send({ success: true, token });
    } catch (error) {
      console.error('Error during user login:', error);
      res
        .status(500)
        .json({ error: 'ServerError', message: 'Internal server error.' });
    }
  },
);
router.post('/refreshToken', async (req, res, next) => {
  const { signedCookies = {} } = req;
  const { refreshToken } = signedCookies;

  if (refreshToken) {
    try {
      const payload = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
      );
      const userId = payload._id;

      const user = await User.findOne({ _id: userId });

      if (user) {
        const tokenIndex = user.refreshToken.findIndex(
          (item) => item.refreshToken === refreshToken,
        );

        if (tokenIndex === -1) {
          res.statusCode = 401;
          res.send('Unauthorized');
        } else {
          const token = getToken({ _id: userId });
          const newRefreshToken = getRefreshToken({ _id: userId });
          user.refreshToken[tokenIndex] = { refreshToken: newRefreshToken };

          await user.save();

          res.cookie('refreshToken', newRefreshToken, COOKIE_OPTIONS);
          res.send({ success: true, token });
        }
      } else {
        res.statusCode = 401;
        res.send('Unauthorized');
      }
    } catch (err) {
      res.statusCode = 401;
      res.send('Unauthorized');
    }
  } else {
    res.statusCode = 401;
    res.send('Unauthorized');
  }
});

router.get('/user', (req, res, next) => {
  res.send(req.user);
});

export default router;
