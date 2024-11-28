document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const fileInput = document.getElementById('musicFile');
    const resultDiv = document.getElementById('result');
    const resultTitle = document.getElementById('resultTitle');
    
    // 파일이 선택되지 않으면 경고 메시지 표시
    if (fileInput.files.length === 0) {
        resultDiv.innerText = 'No file selected.';
        return;
    }

    const formData = new FormData();
    formData.append('musicFile', fileInput.files[0]);

    console.log('Uploading file:', fileInput.files[0]);

    
    resultTitle.innerText = '';  
    resultDiv.innerHTML = '<div class="loader"></div><p>분석중입니다...</p>';

    try {
        const response = await fetch('/analyze', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();
        
        resultTitle.innerText = 'Result';  
        resultDiv.innerText = JSON.stringify(result, null, 2);
    } catch (error) {
        console.error('Error:', error);
        resultTitle.innerText = 'Result';
        resultDiv.innerText = 'Error analyzing music file.';
    }
});
