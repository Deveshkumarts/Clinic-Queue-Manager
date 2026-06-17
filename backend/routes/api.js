const express = require('express');
const router = express.Router();

module.exports = function(io, supabase) {
  // GET /api/queue
  router.get('/queue', async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('queue')
        .select('*')
        .eq('status', 'waiting')
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Map data to match what the frontend expects (_id, tokenNumber, patientName)
      const mappedData = data.map(item => ({
        ...item,
        _id: item.id,
        tokenNumber: item.token_number,
        patientName: item.patient_name
      }));
      res.json(mappedData);
    } catch (error) {
      console.error('Error in GET /api/queue:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/patients
  router.post('/patients', async (req, res) => {
    try {
      const { patientName } = req.body;
      
      // Get the highest token number
      const { data: lastToken, error: tokenError } = await supabase
        .from('queue')
        .select('token_number')
        .order('token_number', { ascending: false })
        .limit(1)
        .single();

      // If no rows found (PGRST116), lastToken will be null due to the catch, but Supabase single() throws.
      // We handle the PGRST116 error below.
      let nextTokenNumber = 1;
      if (lastToken) {
        nextTokenNumber = lastToken.token_number + 1;
      } else if (tokenError && tokenError.code !== 'PGRST116') {
        throw tokenError;
      }

      const { data: newPatient, error } = await supabase
        .from('queue')
        .insert([{
          token_number: nextTokenNumber,
          patient_name: patientName,
          status: 'waiting'
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Emit socket event
      io.emit('queueUpdated');

      res.status(201).json({
        ...newPatient,
        _id: newPatient.id,
        tokenNumber: newPatient.token_number,
        patientName: newPatient.patient_name
      });
    } catch (error) {
      console.error('Error in POST /api/patients:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/settings
  router.get('/settings', async (req, res) => {
    try {
      let { data: settings, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (error && error.code === 'PGRST116') {
        // Insert default if missing
        const { data: newSettings, error: insertError } = await supabase
          .from('settings')
          .insert([{ id: 1, current_serving_token: 0, average_consultation_time: 5 }])
          .select()
          .single();
        if (insertError) throw insertError;
        settings = newSettings;
      } else if (error) {
        throw error;
      }
      
      res.json({
        currentServingToken: settings.current_serving_token,
        averageConsultationTime: settings.average_consultation_time
      });
    } catch (error) {
      console.error('Error in GET /api/settings:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/settings
  router.post('/settings', async (req, res) => {
    try {
      const { averageConsultationTime } = req.body;
      
      const { data: settings, error } = await supabase
        .from('settings')
        .upsert({ id: 1, average_consultation_time: averageConsultationTime })
        .select()
        .single();

      if (error) throw error;

      // Emit socket event
      io.emit('settingsUpdated');

      res.json({
        currentServingToken: settings.current_serving_token,
        averageConsultationTime: settings.average_consultation_time
      });
    } catch (error) {
      console.error('Error in POST /api/settings:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/call-next
  router.post('/call-next', async (req, res) => {
    try {
      let { data: settings, error: settingsError } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (settingsError && settingsError.code === 'PGRST116') {
         const { data: newSettings } = await supabase
          .from('settings')
          .insert([{ id: 1, current_serving_token: 0, average_consultation_time: 5 }])
          .select()
          .single();
         settings = newSettings;
      }

      // Find the next person in queue
      const { data: nextPatient, error: nextPatientError } = await supabase
        .from('queue')
        .select('*')
        .eq('status', 'waiting')
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (nextPatientError && nextPatientError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Queue is empty' });
      } else if (nextPatientError) {
        throw nextPatientError;
      }

      // Mark as completed
      await supabase
        .from('queue')
        .update({ status: 'completed' })
        .eq('id', nextPatient.id);

      // Update current serving token
      const newServingToken = nextPatient.token_number;
      await supabase
        .from('settings')
        .update({ current_serving_token: newServingToken })
        .eq('id', 1);

      // Emit socket events
      io.emit('queueUpdated');
      io.emit('tokenCalled');
      io.emit('settingsUpdated'); 

      res.json({ message: 'Next token called', currentServingToken: newServingToken });
    } catch (error) {
      console.error('Error in POST /api/call-next:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
