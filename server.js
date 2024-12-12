const express = require('express');
const multer = require('multer');
const path = require('path');
const { exec } = require('child_process');
const mongoose = require('mongoose');

const app = express();
require('dotenv').config();

app.use(express.json()); 


mongoose.connect('mongodb://localhost:27017/music_analysis', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});


const resultSchema = new mongoose.Schema({
  fileName: String,
  analysisResult: Object,
  uploadedAt: { type: Date, default: Date.now },
  userId: String
});

const Result = mongoose.model('Result', resultSchema);


const UPLOAD_FOLDER = path.join(__dirname, 'uploads');
const upload = multer({ dest: UPLOAD_FOLDER });

app.use(express.static(path.join(__dirname, 'public')));


const SECRET_KEY = process.env.SECRET_KEY;

if (!SECRET_KEY) {
    console.error('SECRET_KEY is not defined in environment variables!');
    process.exit(1); 
}


const jwt = require('jsonwebtoken');
const token = jwt.sign({ userId: 123 }, SECRET_KEY, { expiresIn: '1h' });
console.log('Generated Token:', token);


try {
    const decoded = jwt.verify(token, SECRET_KEY);
    console.log('Decoded Token:', decoded);
} catch (err) {
    console.error('Invalid token');
}


const authenticate = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded; 
        next(); 
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};


app.post('/analyze',authenticate, upload.single('musicFile'), async (req, res) => {
  const filePath = req.file.path;

  const pythonScript = `python analyze_music.py "${filePath}"`;
  exec(pythonScript, async (error, stdout, stderr) => {
      if (error) {
          console.error(`Error: ${stderr}`);
          return res.status(500).json({ error: 'Error analyzing music file.' });
      }

      try {
          const result = JSON.parse(stdout);

          
          if (req.headers['authorization']) {
              const token = req.headers['authorization'].split(' ')[1];
              const decoded = jwt.verify(token, SECRET_KEY);

              
              await Result.create({
                  fileName: req.file.originalname,
                  analysisResult: result,
                  uploadedAt: new Date(),
                  userId: decoded.id, 
              });
          }

          res.json(result); 
      } catch (err) {
          console.error('Error saving result to MongoDB:', err);
          res.status(500).json({ error: 'Error saving result to database.' });
      }
  });
});


app.get('/results', authenticate, async (req, res) => {
    try {
        console.log('Fetching results for user ID:', req.user.id); 
        const results = await Result.find({ userId: req.user.id }).sort({ uploadedAt: -1 });
        console.log('Results found:', results); 
        res.json(results);
    } catch (err) {
        console.error('Error fetching results:', err);
        res.status(500).json({ error: 'Error fetching results from database.' });
    }
});





app.delete('/results/:id', authenticate, async (req, res) => {
  const resultId = req.params.id;

  try {
      const result = await Result.findOne({ _id: resultId, userId: req.user.id });

      if (!result) {
          return res.status(404).json({ error: 'Result not found or not authorized to delete' });
      }

      await Result.findByIdAndDelete(resultId);
      res.json({ message: 'Result deleted successfully.' });
  } catch (err) {
      console.error('Error deleting result:', err);
      res.status(500).json({ error: 'Error deleting result.' });
  }
});

const users = [
    { id: 1, username: 'testuser', password: 'password123' },
    { id: 2, username: 'web', password: '2024' },
];

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
        return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
});

app.get('/results.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'results.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
