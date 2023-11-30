import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import dotenv from 'dotenv';
import './utils/database.js';
import './strategies/JWTStrategy.js';
import './strategies/LocalStrategy.js';
import './utils/auth.js';
import userRouter from './routes/userRoutes.js';
import session from 'express-session';
import User from './models/user_model.js';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const app = express();

app.use(bodyParser.json());
app.use(cookieParser('C8vp1M47IPsqUL8o'));

const whitelist = 'http://localhost:3000'
  ? 'http://localhost:3000'.split(',')
  : [];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },

  credentials: true,
};

app.use(cors(corsOptions));

app.use(
  session({
    secret: 'gWF6Zc4EQoKlMde6',
    resave: false,
    saveUninitialized: true,
  }),
);

app.use(passport.session());
app.use(passport.initialize());

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (username, done) => {
  try {
    const user = await User.findOne({ username: username });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

app.use('/users', userRouter);

app.get('/', function (req, res) {
  res.send({ status: 'success' });
});

const server = app.listen(process.env.PORT || 5000, function () {
  const port = server.address().port;
  console.log('App started at port:', port);
});
