import { useState, useEffect } from "react";
import AudioPlayer from "./components/AudioPlayer";
import { loadAudio } from "./utils/audioUtils";

const AUDIO_URL = "/audio/audio.m4a";

const App = () => {
  const [audioSource, setAudioSource] = useState(null);

  // Se carga una sola vez: el blob URL se revoca al desmontar.
  useEffect(() => {
    let cancelled = false;
    let objectUrl;

    const fetchAudio = async () => {
      objectUrl = await loadAudio(AUDIO_URL);
      if (!cancelled) setAudioSource(objectUrl);
    };

    fetchAudio();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  return (
    <div
      style={{
        width: "100%",
        boxSizing: "border-box",
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
      }}
    >
      <div style={{ width: "100%" }}>
        <h1
          style={{
            margin: "0.4em 0",
            fontSize: "42px",
            lineHeight: "1",
            textAlign: "center",
          }}
        >
          Motri - La tumba de los perros
        </h1>

        <AudioPlayer audioSource={audioSource} />

        {/* El visualizador p5 necesita el analyser que expone AudioPlayer:
            <AudioVisualizer analyser={analyser} audioContext={audioContext} /> */}
      </div>
    </div>
  );
};

export default App;
