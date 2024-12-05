document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const fileInput = document.getElementById('musicFile');
    const resultDiv = document.getElementById('result');
    const resultTitle = document.getElementById('resultTitle');
    
    
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

document.getElementById('fetchResults').addEventListener('click', async () => {
    const previousResultsDiv = document.getElementById('previousResults');
    previousResultsDiv.innerHTML = '<p>Loading previous results...</p>';

    const token = localStorage.getItem('token'); 
    
    try {
        const response = await fetch('/results');
        const results = await response.json();

        previousResultsDiv.innerHTML = '<h3>Previous Results:</h3>';
        results.forEach(result => {
            const resultItem = document.createElement('div');
            resultItem.innerHTML = `
                <p><strong>File Name:</strong> ${result.fileName}</p>
                <p><strong>Analysis Result:</strong> ${JSON.stringify(result.analysisResult)}</p>
                <p><strong>Uploaded At:</strong> ${new Date(result.uploadedAt).toLocaleString()}</p>
                <button class="deleteButton" data-id="${result._id}">Delete</button>
                <hr>
            `;
            previousResultsDiv.appendChild(resultItem);
        });

        // 삭제 버튼 이벤트 추가
        document.querySelectorAll('.deleteButton').forEach(button => {
            button.addEventListener('click', async (event) => {
                const resultId = event.target.dataset.id;

                try {
                    const deleteResponse = await fetch(`/results/${resultId}`, {
                        method: 'DELETE',
                    });

                    const deleteResult = await deleteResponse.json();

                    if (deleteResponse.ok) {
                        alert('Result deleted successfully!');
                        event.target.parentElement.remove(); // 삭제한 결과를 UI에서 제거
                    } else {
                        alert(`Error deleting result: ${deleteResult.error}`);
                    }
                } catch (error) {
                    console.error('Error deleting result:', error);
                    alert('Error deleting result.');
                }
            });
        });
    } catch (error) {
        console.error('Error fetching results:', error);
        previousResultsDiv.innerText = 'Error loading results.';
    }
});
// 로그인 후 저장된 토큰

// 결과 저장 시 토큰 추가
async function saveAnalysisResult(data) {
    const response = await fetch('/analyze', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    return response.json();
}

// 결과 조회 시 토큰 추가
async function fetchResults() {
    const response = await fetch('/results', {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    return response.json();
}


