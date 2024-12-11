import librosa
import numpy as np
import json
import matplotlib.pyplot as plt
import base64
import io

def analyze_music(file_path):
    """
    음악 파일을 분석하여 주요 정보를 반환
    """
    try:
        # 음악 파일 로드
        y, sr = librosa.load(file_path, sr=None)

        # 1. 템포(BPM) 분석
        tempo, _ = librosa.beat.beat_track(y=y, sr=sr)

        # 2. Chroma Feature 분석 (조성 및 화음 추출)
        chroma = librosa.feature.chroma_stft(y=y, sr=sr)
        chroma_mean = np.mean(chroma, axis=1)  # 평균값 계산

        # 조성(Key) 추출
        key_index = np.argmax(chroma_mean)
        key_map = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        detected_key = key_map[key_index]

        # 3. 곡 구조 분석 (구간별 에너지)
        onset_env = librosa.onset.onset_strength(y=y, sr=sr)

        # 4. 스펙트럼 분석 (주파수 분포)
        spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)
        spectral_bandwidth = librosa.feature.spectral_bandwidth(y=y, sr=sr)

        # 5. 다이나믹 분석 (신호의 RMS 값)
        rms = librosa.feature.rms(y=y)
        
        # 시각화 생성
        plt.figure(figsize=(12, 8))

        # Chroma Mean 시각화
        plt.subplot(3, 1, 1)
        plt.bar(key_map, chroma_mean, color='skyblue')
        plt.title('Chroma Mean (Pitch Class Distribution)')
        plt.xlabel('Pitch Class')
        plt.ylabel('Mean Intensity')

        # 스펙트럼 분석 시각화
        plt.subplot(3, 1, 2)
        plt.plot(np.mean(spectral_centroid, axis=1), label='Spectral Centroid', color='orange')
        plt.plot(np.mean(spectral_bandwidth, axis=1), label='Spectral Bandwidth', color='green')
        plt.title('Spectral Features')
        plt.xlabel('Frame')
        plt.ylabel('Frequency (Hz)')
        plt.legend()

        # RMS 시각화
        plt.subplot(3, 1, 3)
        plt.plot(rms[0], label='RMS Energy', color='red')
        plt.title('RMS Energy')
        plt.xlabel('Frame')
        plt.ylabel('Energy')
        plt.legend()

        plt.tight_layout()

        # 시각화를 메모리에 저장하고 Base64로 변환
        buf = io.BytesIO()
        plt.savefig(buf, format='png')
        buf.seek(0)
        img_base64 = base64.b64encode(buf.read()).decode('utf-8')
        buf.close()

        # 분석 결과를 JSON으로 정리
        result = {
            "BPM": round(float(tempo), 2),
            "Key": detected_key,
            "Spectral Centroid Mean": np.mean(spectral_centroid).tolist(),
            "Spectral Bandwidth Mean": np.mean(spectral_bandwidth).tolist(),
            "RMS Mean": np.mean(rms).tolist(),
            "Visualization": f"data:image/png;base64,{img_base64}"
        }

        return result
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file path provided"}))
        sys.exit(1)

    file_path = sys.argv[1]
    result = analyze_music(file_path)
    print(json.dumps(result, indent=2))
