import librosa
import numpy as np
import json

def analyze_music(file_path):
    """
    음악 파일 분석 함수: BPM과 키(Key) 추출
    """
    try:
        # 음악 파일 로드
        y, sr = librosa.load(file_path, sr=None)

        # BPM 분석
        y_harmonic, y_percussive = librosa.effects.hpss(y)

        # BPM 감지 (beat_track)
        tempo, _ = librosa.beat.beat_track(y=y_percussive, sr=sr, start_bpm=90.0)

        # 추가적으로 Autocorrelation 기반 BPM 계산
        onset_env = librosa.onset.onset_strength(y=y, sr=sr, aggregate=np.median)
        refined_tempo = librosa.beat.tempo(onset_envelope=onset_env, sr=sr)


        # 키 분석
        chroma = librosa.feature.chroma_stft(y=y, sr=sr)
        chroma_mean = np.mean(chroma, axis=1)  # NumPy 배열
        key = np.argmax(chroma_mean)  # 최대값의 인덱스

        # 키 매핑
        key_map = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        detected_key = key_map[key]

        # 결과 반환 (NumPy 데이터를 Python 데이터로 변환)
        return {
            "BPM": round(float(refined_tempo[0]), 2),              # NumPy 데이터 -> float 변환
            "Key": detected_key,
            "Chroma Mean": chroma_mean.tolist()         # NumPy 배열 -> list 변환
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file path provided"}))
        sys.exit(1)

    file_path = sys.argv[1]
    result = analyze_music(file_path)
    print(json.dumps(result, indent=2))  # JSON으로 출력
