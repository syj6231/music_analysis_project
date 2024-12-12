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
        y, sr = librosa.load(file_path, sr=None)

        
        tempo, _ = librosa.beat.beat_track(y=y, sr=sr)

        
        chroma = librosa.feature.chroma_stft(y=y, sr=sr)
        chroma_mean = np.mean(chroma, axis=1)

        
        key_index = np.argmax(chroma_mean)
        key_map = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        detected_key = key_map[key_index]

        
        onset_env = librosa.onset.onset_strength(y=y, sr=sr)

        
        spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)
        spectral_bandwidth = librosa.feature.spectral_bandwidth(y=y, sr=sr)

        
        rms = librosa.feature.rms(y=y)
        
        
        plt.figure(figsize=(12, 8))

        
        plt.subplot(3, 1, 1)
        plt.bar(key_map, chroma_mean, color='skyblue')
        plt.title('Chroma Mean (Pitch Class Distribution)')
        plt.xlabel('Pitch Class')
        plt.ylabel('Mean Intensity')

        
        plt.subplot(3, 1, 2)
        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        librosa.display.specshow(mfcc, sr=sr, x_axis='time', cmap='coolwarm')
        plt.colorbar()
        plt.title('MFCC')
        plt.xlabel('Time (s)')
        plt.ylabel('MFCC Coefficients')

        
        plt.subplot(3, 1, 3)
        plt.plot(rms[0], label='RMS Energy', color='red')
        plt.title('RMS Energy')
        plt.xlabel('Frame')
        plt.ylabel('Energy')
        plt.legend()

        plt.tight_layout()

        
        buf = io.BytesIO()
        plt.savefig(buf, format='png')
        buf.seek(0)
        img_base64 = base64.b64encode(buf.read()).decode('utf-8')
        buf.close()

    
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