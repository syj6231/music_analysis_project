const express = require('express');
const multer = require('multer');
const path = require('path');
const { exec } = require('child_process');

const app = express();


const UPLOAD_FOLDER = path.join(__dirname, 'uploads');
const upload = multer({ dest: UPLOAD_FOLDER });


app.use(express.static(path.join(__dirname, 'public')));

// API: 음악 파일 업로드 및 분석
app.post('/analyze', upload.single('musicFile'), (req, res) => {
  const filePath = req.file.path;


  const pythonScript = `python analyze_music.py  "${req.file.path}"`;
  exec(pythonScript, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${stderr}`);
      return res.status(500).json({ error: 'Error analyzing music file.' });
    }

    
    const result = JSON.parse(stdout);
    res.json(result);
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
