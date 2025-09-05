const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (replace with database in production)
let users = [];
let patients = [];
let doctors = [];
let mappings = [];
let userIdCounter = 1;
let patientIdCounter = 1;
let doctorIdCounter = 1;
let mappingIdCounter = 1;

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Authentication Routes
app.post('/api/auth/register/', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = {
      id: userIdCounter++,
      name,
      email,
      password: hashedPassword
    };

    users.push(user);

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login/', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      access: token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Patient Routes
app.post('/api/patients/', authenticateToken, (req, res) => {
  try {
    const { name, age, gender, phone, address, medical_history } = req.body;

    if (!name || !age || !gender) {
      return res.status(400).json({ error: 'Name, age, and gender are required' });
    }

    const patient = {
      id: patientIdCounter++,
      name,
      age,
      gender,
      phone: phone || '',
      address: address || '',
      medical_history: medical_history || '',
      created_by: req.user.userId,
      created_at: new Date().toISOString()
    };

    patients.push(patient);
    res.status(201).json(patient);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/patients/', authenticateToken, (req, res) => {
  try {
    const userPatients = patients.filter(patient => patient.created_by === req.user.userId);
    res.json(userPatients);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/patients/:id/', authenticateToken, (req, res) => {
  try {
    const patientId = parseInt(req.params.id);
    const patient = patients.find(p => p.id === patientId && p.created_by === req.user.userId);

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/patients/:id/', authenticateToken, (req, res) => {
  try {
    const patientId = parseInt(req.params.id);
    const patientIndex = patients.findIndex(p => p.id === patientId && p.created_by === req.user.userId);

    if (patientIndex === -1) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const { name, age, gender, phone, address, medical_history } = req.body;

    patients[patientIndex] = {
      ...patients[patientIndex],
      name: name || patients[patientIndex].name,
      age: age || patients[patientIndex].age,
      gender: gender || patients[patientIndex].gender,
      phone: phone !== undefined ? phone : patients[patientIndex].phone,
      address: address !== undefined ? address : patients[patientIndex].address,
      medical_history: medical_history !== undefined ? medical_history : patients[patientIndex].medical_history
    };

    res.json(patients[patientIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/patients/:id/', authenticateToken, (req, res) => {
  try {
    const patientId = parseInt(req.params.id);
    const patientIndex = patients.findIndex(p => p.id === patientId && p.created_by === req.user.userId);

    if (patientIndex === -1) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    patients.splice(patientIndex, 1);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Doctor Routes
app.post('/api/doctors/', authenticateToken, (req, res) => {
  try {
    const { name, specialization, phone, email, experience_years } = req.body;

    if (!name || !specialization) {
      return res.status(400).json({ error: 'Name and specialization are required' });
    }

    const doctor = {
      id: doctorIdCounter++,
      name,
      specialization,
      phone: phone || '',
      email: email || '',
      experience_years: experience_years || 0,
      created_at: new Date().toISOString()
    };

    doctors.push(doctor);
    res.status(201).json(doctor);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/doctors/', authenticateToken, (req, res) => {
  try {
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/doctors/:id/', authenticateToken, (req, res) => {
  try {
    const doctorId = parseInt(req.params.id);
    const doctor = doctors.find(d => d.id === doctorId);

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json(doctor);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/doctors/:id/', authenticateToken, (req, res) => {
  try {
    const doctorId = parseInt(req.params.id);
    const doctorIndex = doctors.findIndex(d => d.id === doctorId);

    if (doctorIndex === -1) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const { name, specialization, phone, email, experience_years } = req.body;

    doctors[doctorIndex] = {
      ...doctors[doctorIndex],
      name: name || doctors[doctorIndex].name,
      specialization: specialization || doctors[doctorIndex].specialization,
      phone: phone !== undefined ? phone : doctors[doctorIndex].phone,
      email: email !== undefined ? email : doctors[doctorIndex].email,
      experience_years: experience_years !== undefined ? experience_years : doctors[doctorIndex].experience_years
    };

    res.json(doctors[doctorIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/doctors/:id/', authenticateToken, (req, res) => {
  try {
    const doctorId = parseInt(req.params.id);
    const doctorIndex = doctors.findIndex(d => d.id === doctorId);

    if (doctorIndex === -1) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    doctors.splice(doctorIndex, 1);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mapping Routes
app.post('/api/mappings/', authenticateToken, (req, res) => {
  try {
    const { patient_id, doctor_id, notes } = req.body;

    if (!patient_id || !doctor_id) {
      return res.status(400).json({ error: 'Patient ID and Doctor ID are required' });
    }

    // Check if patient exists and belongs to user
    const patient = patients.find(p => p.id === patient_id && p.created_by === req.user.userId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Check if doctor exists
    const doctor = doctors.find(d => d.id === doctor_id);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Check if mapping already exists
    const existingMapping = mappings.find(m => m.patient_id === patient_id && m.doctor_id === doctor_id);
    if (existingMapping) {
      return res.status(400).json({ error: 'This patient is already assigned to this doctor' });
    }

    const mapping = {
      id: mappingIdCounter++,
      patient_id,
      doctor_id,
      notes: notes || '',
      status: 'active',
      created_at: new Date().toISOString()
    };

    mappings.push(mapping);
    res.status(201).json(mapping);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/mappings/', authenticateToken, (req, res) => {
  try {
    // Get mappings for patients created by the authenticated user
    const userPatientIds = patients
      .filter(p => p.created_by === req.user.userId)
      .map(p => p.id);
    
    const userMappings = mappings.filter(m => userPatientIds.includes(m.patient_id));
    res.json(userMappings);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/mappings/:patient_id/', authenticateToken, (req, res) => {
  try {
    const patientId = parseInt(req.params.patient_id);
    
    // Check if patient exists and belongs to user
    const patient = patients.find(p => p.id === patientId && p.created_by === req.user.userId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const patientMappings = mappings.filter(m => m.patient_id === patientId);
    res.json(patientMappings);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/mappings/:id/', authenticateToken, (req, res) => {
  try {
    const mappingId = parseInt(req.params.id);
    const mappingIndex = mappings.findIndex(m => m.id === mappingId);

    if (mappingIndex === -1) {
      return res.status(404).json({ error: 'Mapping not found' });
    }

    // Check if the mapping belongs to a patient created by the user
    const mapping = mappings[mappingIndex];
    const patient = patients.find(p => p.id === mapping.patient_id && p.created_by === req.user.userId);
    if (!patient) {
      return res.status(403).json({ error: 'Access denied' });
    }

    mappings.splice(mappingIndex, 1);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health/', (req, res) => {
  res.json({ status: 'OK', message: 'Healthcare Backend API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Healthcare Backend API running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('- POST /api/auth/register/');
  console.log('- POST /api/auth/login/');
  console.log('- GET/POST/PUT/DELETE /api/patients/');
  console.log('- GET/POST/PUT/DELETE /api/doctors/');
  console.log('- GET/POST/DELETE /api/mappings/');
});