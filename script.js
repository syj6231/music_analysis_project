document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token); // JWT 저장
            document.getElementById('loginMessage').innerText = 'Login successful!';
            
            // UI 업데이트: 로그인 폼 숨기기, 기능 활성화
            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('uploadForm').style.display = 'block';
            document.getElementById('fetchResults').style.display = 'inline-block';
        } else {
            document.getElementById('loginMessage').innerText = data.error;
        }
    } catch (error) {
        console.error('Login error:', error);
        document.getElementById('loginMessage').innerText = 'An error occurred.';
    }
});

window.onload = () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
        document.getElementById('uploadForm').style.display = 'none';
        document.getElementById('fetchResults').style.display = 'none';
    }
};




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
        const token = localStorage.getItem('token'); // 저장된 JWT 가져오기

        const response = await fetch('/analyze', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`, // JWT 추가
    },
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

const token = localStorage.getItem('token'); // 로그인 시 저장된 토큰

document.getElementById('fetchResults').addEventListener('click', async () => {
    const previousResultsDiv = document.getElementById('previousResults');
    previousResultsDiv.innerHTML = '<p>Loading previous results...</p>';

    try {
        const token = localStorage.getItem('token'); // 저장된 JWT 가져오기

        const response = await fetch('/results', {
            headers: {
                'Authorization': `Bearer ${token}`, // JWT 추가
            },
        });

        if (!response.ok) throw new Error('Failed to fetch results');

        const results = await response.json();

        previousResultsDiv.innerHTML = ''; // 기존 메시지 제거

        results.forEach(result => {
            const resultCard = document.createElement('div');
            resultCard.classList.add('result-card');

            resultCard.innerHTML = `
                <h3>${result.fileName}</h3>
                <p><strong>Uploaded At:</strong> ${new Date(result.uploadedAt).toLocaleString()}</p>
                <p><strong>BPM:</strong> ${result.analysisResult.BPM}</p>
                <p><strong>Key:</strong> ${result.analysisResult.Key}</p>
                <button class="delete-btn" data-id="${result._id}">Delete</button>
            `;

            previousResultsDiv.appendChild(resultCard);
        });

        // 삭제 버튼 이벤트 리스너 추가
        const deleteButtons = document.querySelectorAll('.delete-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', async (event) => {
                const resultId = event.target.getAttribute('data-id');
                await deleteResult(resultId);
                event.target.parentElement.remove(); // UI에서 카드 삭제
            });
        });
    } catch (error) {
        console.error('Error fetching results:', error);
        previousResultsDiv.innerText = 'Error loading results.';
    }
});

async function deleteResult(resultId) {
    try {
        const token = localStorage.getItem('token'); // 저장된 JWT 가져오기
        const response = await fetch(`/results/${resultId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) throw new Error('Failed to delete result');
        alert('Result deleted successfully!');
    } catch (error) {
        console.error('Error deleting result:', error);
        alert('Failed to delete result.');
    }
}





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

async function fetchResults() {
    const response = await fetch('/results', {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    return response.json();
}


