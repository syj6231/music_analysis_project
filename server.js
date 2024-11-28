const express = require('express');
const multer = require('multer');
const path = require('path');
const { exec } = require('child_process');

const app = express();

// 업로드 폴더 설정
const UPLOAD_FOLDER = path.join(__dirname, 'uploads');
const upload = multer({ dest: UPLOAD_FOLDER });

// 정적 파일 경로 설정
app.use(express.static(path.join(__dirname, 'public')));

// API: 음악 파일 업로드 및 분석
app.post('/analyze', upload.single('musicFile'), (req, res) => {
  const filePath = req.file.path;

  // Python 스크립트 실행 (librosa 사용)
  const pythonScript = `python analyze_music.py  "${req.file.path}"`;
  exec(pythonScript, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${stderr}`);
      return res.status(500).json({ error: 'Error analyzing music file.' });
    }

    // Python 출력값 반환
    const result = JSON.parse(stdout);
    res.json(result);
  });
});

// 서버 실행
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
