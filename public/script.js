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
            document.getElementById('logoutButton').style.display = 'inline-block';
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
        resultDiv.innerHTML = `
        <p><strong>BPM:</strong> ${result.BPM}</p>
        <p><strong>Key:</strong> ${result.Key}</p>
        <p><strong>Spectral Centroid Mean:</strong> ${result["Spectral Centroid Mean"]}</p>
        <p><strong>Spectral Bandwidth Mean:</strong> ${result["Spectral Bandwidth Mean"]}</p>
        <p><strong>RMS Mean:</strong> ${result["RMS Mean"]}</p>
        <button id="showImageBtn">Show Visualization</button>
        `;

        document.getElementById('showImageBtn').addEventListener('click', () => {
            const imageWindow = window.open("", "_blank", "width=800,height=600");
            imageWindow.document.write(`
                <html>
                    <head>
                        <title>Visualization</title>
                    </head>
                    <body>
                        <img src="${result.Visualization}" alt="Visualization Graph" style="width: 100%; height: auto;">
                    </body>
                </html>
            `);
        });

    } catch (error) {
        console.error('Error:', error);
        resultTitle.innerText = 'Result';
        resultDiv.innerText = 'Error analyzing music file.';
    }
});

const token = localStorage.getItem('token'); // 로그인 시 저장된 토큰

document.getElementById('fetchResults').addEventListener('click', () => {
    window.location.href = '/results.html'; // 현재 창에서 results.html로 이동
});





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

// 페이지 로드 시 로그인 상태 확인
window.onload = () => {
    const token = localStorage.getItem('token'); // JWT 토큰 가져오기

    if (token) {
        // 로그인 상태: 로그인 폼 숨기기, 기능 활성화, 로그아웃 버튼 표시
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('uploadForm').style.display = 'block';
        document.getElementById('fetchResults').style.display = 'inline-block';
        document.getElementById('logoutButton').style.display = 'inline-block';
    } else {
        // 비로그인 상태: 로그인 폼 표시
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('uploadForm').style.display = 'none';
        document.getElementById('fetchResults').style.display = 'none';
        document.getElementById('logoutButton').style.display = 'none';
    }
};

// 로그아웃 버튼 이벤트 리스너
document.getElementById('logoutButton').addEventListener('click', () => {
    // JWT 토큰 제거
    localStorage.removeItem('token');

    // UI 업데이트: 로그인 폼 표시, 기타 버튼 숨기기
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('uploadForm').style.display = 'none';
    document.getElementById('fetchResults').style.display = 'none';
    document.getElementById('logoutButton').style.display = 'none';

    alert('You have successfully logged out!');
});

