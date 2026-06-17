const mongoose = require('mongoose');

const uri1 = 'mongodb+srv://deweshk2328_db_user:LSmh80FnNRMfwEmN@cluster0.9ne2mz2.mongodb.net/clinicQueue?retryWrites=true&w=majority';
const uri2 = 'mongodb://deweshk2328_db_user:LSmh80FnNRMfwEmN@ac-fkqfahi-shard-00-00.9ne2mz2.mongodb.net:27017,ac-fkqfahi-shard-00-01.9ne2mz2.mongodb.net:27017,ac-fkqfahi-shard-00-02.9ne2mz2.mongodb.net:27017/clinicQueue?tls=true&replicaSet=atlas-ta2x3e-shard-0&authSource=admin';

async function test() {
  console.log('Testing URI 1 (SRV)...');
  try {
    await mongoose.connect(uri1, { serverSelectionTimeoutMS: 5000 });
    console.log('URI 1 SUCCESS');
    mongoose.disconnect();
  } catch (e) {
    console.error('URI 1 FAILED:', e.message);
  }

  console.log('\nTesting URI 2 (Direct)...');
  try {
    await mongoose.connect(uri2, { serverSelectionTimeoutMS: 5000 });
    console.log('URI 2 SUCCESS');
    mongoose.disconnect();
  } catch (e) {
    console.error('URI 2 FAILED:', e.message);
  }
}

test();
