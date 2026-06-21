const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const Token = require('./models/Token');
const Settings = require('./models/Settings');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/clinic-queue')
  .then(() => console.log('Connected to local MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Seed default settings
async function initSettings() {
  const settings = await Settings.findOne({ key: 'global' });
  if (!settings) {
    await Settings.create({ key: 'global', baselineConsultationTime: 5 });
  }
}
initSettings();

// Helper to broadcast state
async function broadcastState() {
  try {
    const activeToken = await Token.findOne({ status: 'ACTIVE' });
    const waitingTokens = await Token.find({ status: 'WAITING' }).sort({ isEmergency: -1, tokenNumber: 1 });
    const settings = await Settings.findOne({ key: 'global' });
    
    // Calculate real average consultation time
    const completedTokens = await Token.find({ status: 'COMPLETED' })
      .sort({ completedAt: -1 })
      .limit(10);
      
    let avgConsultationMs;
    if (completedTokens.length > 0) {
      let totalTime = 0;
      let count = 0;
      for (const token of completedTokens) {
        if (token.calledAt && token.completedAt) {
          totalTime += (token.completedAt - token.calledAt);
          count++;
        }
      }
      avgConsultationMs = count > 0 ? (totalTime / count) : (settings.baselineConsultationTime * 60 * 1000);
    } else {
      avgConsultationMs = settings.baselineConsultationTime * 60 * 1000;
    }
    
    io.emit('queueState', {
      activeToken,
      waitingTokens,
      avgConsultationTime: Math.round(avgConsultationMs / 60000), // in minutes
      baselineConsultationTime: settings ? settings.baselineConsultationTime : 5,
      doctorStatus: settings ? settings.doctorStatus : 'AVAILABLE',
      statusMessage: settings ? settings.statusMessage : ''
    });
    return avgConsultationMs;
  } catch (err) {
    console.error('Error broadcasting state:', err);
    return 5 * 60 * 1000;
  }
}

let autoCallTimeout = null;

async function autoCompleteToken() {
  try {
    const currentActive = await Token.findOne({ status: 'ACTIVE' });
    if (currentActive) {
      currentActive.status = 'COMPLETED';
      currentActive.completedAt = new Date();
      await currentActive.save();
      await broadcastState();
    }
  } catch (err) {
    console.error('Error auto-completing token:', err);
  }
}

async function processCallNext() {
  try {
    const now = new Date();
    // Mark current active as completed
    const currentActive = await Token.findOne({ status: 'ACTIVE' });
    if (currentActive) {
      currentActive.status = 'COMPLETED';
      currentActive.completedAt = now;
      await currentActive.save();
    }

    // Find next waiting
    const nextWaiting = await Token.findOne({ status: 'WAITING' }).sort({ isEmergency: -1, tokenNumber: 1 });
    if (nextWaiting) {
      nextWaiting.status = 'ACTIVE';
      nextWaiting.calledAt = now;
      await nextWaiting.save();
      io.emit('tokenCalled', nextWaiting);
    }
    
    const avgMs = await broadcastState();

    if (autoCallTimeout) {
      clearTimeout(autoCallTimeout);
      autoCallTimeout = null;
    }

    if (nextWaiting) {
      autoCallTimeout = setTimeout(() => {
        autoCompleteToken();
      }, avgMs);
    }
  } catch (err) {
    console.error('Error processing next token:', err);
  }
}

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  broadcastState();

  socket.on('addPatient', async (data) => {
    try {
      // Find highest token number
      const highestToken = await Token.findOne().sort({ tokenNumber: -1 });
      const nextTokenNumber = highestToken ? highestToken.tokenNumber + 1 : 1;
      
      await Token.create({
        patientName: data.patientName,
        tokenNumber: nextTokenNumber,
        isEmergency: data.isEmergency || false,
        status: 'WAITING'
      });
      broadcastState();
    } catch (err) {
      console.error('Error adding patient:', err);
    }
  });

  socket.on('callNext', () => {
    processCallNext();
  });

  socket.on('setBaselineTime', async (data) => {
    try {
      await Settings.findOneAndUpdate(
        { key: 'global' },
        { baselineConsultationTime: data.time },
        { upsert: true }
      );
      broadcastState();
    } catch (err) {
      console.error('Error setting baseline time:', err);
    }
  });

  socket.on('setDoctorStatus', async (data) => {
    try {
      await Settings.findOneAndUpdate(
        { key: 'global' },
        { doctorStatus: data.status, statusMessage: data.message },
        { upsert: true }
      );
      broadcastState();
    } catch (err) {
      console.error('Error setting doctor status:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  socket.on('getAnalytics', async () => {
    try {
      const today = new Date();
      today.setHours(0,0,0,0);
      
      const totalPatients = await Token.countDocuments({ addedAt: { $gte: today } });
      const emergencies = await Token.countDocuments({ isEmergency: true, addedAt: { $gte: today } });
      const completed = await Token.find({ status: 'COMPLETED', addedAt: { $gte: today } });
      
      let totalTime = 0;
      let count = 0;
      completed.forEach(t => {
        if (t.calledAt && t.completedAt) {
          totalTime += (t.completedAt - t.calledAt);
          count++;
        }
      });
      
      const avgMs = count > 0 ? (totalTime / count) : 0;
      
      socket.emit('analyticsData', {
        totalPatients,
        emergencies,
        completedCount: completed.length,
        avgConsultationMinutes: Math.round(avgMs / 60000) || 5
      });
    } catch (err) {
      console.error(err);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
