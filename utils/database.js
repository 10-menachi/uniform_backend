import mongoose from 'mongoose';
const url =
  'mongodb+srv://timberwamalwa:Christian2002@uniform-distribution.l8ieii5.mongodb.net/?retryWrites=true&w=majority';
const connection = mongoose.connect(url);

connection
  .then((db) => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.log('Error connecting to MongoDB', err.message);
  });
