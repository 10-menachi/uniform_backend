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

app.use(passport.initialize());

app.use('/users', userRouter);

app.get('/', function (req, res) {
  res.send({ status: 'success' });
});

const server = app.listen(process.env.PORT || 5000, function () {
  const port = server.address().port;
  console.log('App started at port:', port);
});
