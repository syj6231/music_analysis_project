const express = require('express');
const multer = require('multer');
const path = require('path');
const { exec } = require('child_process');
const mongoose = require('mongoose');

const app = express();

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
  uploadedAt: { type: Date, default: Date.now }
});

const Result = mongoose.model('Result', resultSchema);

const UPLOAD_FOLDER = path.join(__dirname, 'uploads');
const upload = multer({ dest: UPLOAD_FOLDER });

app.use(express.static(path.join(__dirname, 'public')));

app.post('/analyze', upload.single('musicFile'), async (req, res) => {
  const filePath = req.file.path;

  const pythonScript = `python analyze_music.py "${filePath}"`;
  exec(pythonScript, async (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${stderr}`);
      return res.status(500).json({ error: 'Error analyzing music file.' });
    }

    try {
      const result = JSON.parse(stdout);

      
      const savedResult = await Result.create({
        fileName: req.file.originalname,
        analysisResult: result
      });

      res.json(savedResult);
    } catch (err) {
      console.error('Error saving result to MongoDB:', err);
      res.status(500).json({ error: 'Error saving result to database.' });
    }
  });
});

app.get('/results', async (req, res) => {
  try {
    const results = await Result.find().sort({ uploadedAt: -1 });
    res.json(results);
  } catch (err) {
    console.error('Error fetching results:', err);
    res.status(500).json({ error: 'Error fetching results from database.' });
  }
});

app.delete('/results/:id', async (req, res) => {
  const resultId = req.params.id;

  try {
    const deletedResult = await Result.findByIdAndDelete(resultId);

    if (!deletedResult) {
      return res.status(404).json({ error: 'Result not found.' });
    }

    res.json({ message: 'Result deleted successfully.', result: deletedResult });
  } catch (err) {
    console.error('Error deleting result:', err);
    res.status(500).json({ error: 'Error deleting result.' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
