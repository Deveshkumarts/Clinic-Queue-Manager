const mongoose = require('mongoose');
const Token = require('./models/Token');

mongoose.connect('mongodb://127.0.0.1:27017/clinic-queue')
  .then(async () => {
    await Token.deleteMany({});
    console.log('All tokens cleared.');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
