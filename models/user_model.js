import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import passportLocalMongoose from 'passport-local-mongoose';

const Session = new Schema({
  refreshToken: {
    type: String,
    default: '',
  },
});

const User = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ['school', 'distributor'],
    default: 'school',
  },
  schoolName: {
    type: String,
    default: '',
  },
  companyName: {
    type: String,
    default: '',
  },
  refreshToken: {
    type: [Session],
  },
});

User.set('toJSON', {
  transform: function (doc, ret, options) {
    delete ret.refreshToken;
    return ret;
  },
});

User.plugin(passportLocalMongoose);

export default mongoose.model('User', User);
