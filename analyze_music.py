import librosa
import numpy as np
import json

def analyze_music(file_path):
    """
    음악 파일 분석 함수: BPM과 키(Key) 추출
    """
    try:
        
        y, sr = librosa.load(file_path, sr=None)

        
        y_harmonic, y_percussive = librosa.effects.hpss(y)

        
        tempo, _ = librosa.beat.beat_track(y=y_percussive, sr=sr, start_bpm=90.0)

        
        onset_env = librosa.onset.onset_strength(y=y, sr=sr, aggregate=np.median)
        refined_tempo = librosa.beat.tempo(onset_envelope=onset_env, sr=sr)


        
        chroma = librosa.feature.chroma_stft(y=y, sr=sr)
        chroma_mean = np.mean(chroma, axis=1)  
        key = np.argmax(chroma_mean)  

        
        key_map = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        detected_key = key_map[key]

        
        return {
            "BPM (beat_track)": round(float(tempo), 2),
            "BPM": round(float(refined_tempo[0]), 2),            
            "Key": detected_key,
            "Chroma Mean": chroma_mean.tolist()        
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
    print(json.dumps(result, indent=2))  