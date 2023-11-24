import passport from 'passport';
import LocalStrategy from 'passport-local';
import User from '../models/user_model.js';

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
