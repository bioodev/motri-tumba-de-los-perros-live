import { useMemo, useCallback, useRef, useEffect, useState } from "react";
import { useWavesurfer } from "@wavesurfer/react";
import Timeline from "wavesurfer.js/dist/plugins/timeline.esm.js";
import Spectrogram from "wavesurfer.js/dist/plugins/spectrogram.esm.js";
import { Play, Pause } from "lucide-react";
import { openDB } from "idb";

const AUDIO_URL = "/audio/audio.m4a";
const DB_NAME = "audioDB";
const STORE_NAME = "audioFiles";
const AUDIO_KEY = "currentAudio";

const formatTime = (seconds) =>
  [seconds / 60, seconds % 60]
    .map((v) => `0${Math.floor(v)}`.slice(-2))
    .join(":");

const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME);
    },
  });
};

const loadAudio = async (url) => {
  const db = await initDB();
  let audioBlob = await db.get(STORE_NAME, AUDIO_KEY);

  if (!audioBlob) {
    const response = await fetch(url);
    audioBlob = await response.blob();
    await db.put(STORE_NAME, audioBlob, AUDIO_KEY);
  }

  return URL.createObjectURL(audioBlob);
};

const App = () => {
  const containerRef = useRef(null);
  const spectrogramRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [audioSource, setAudioSource] = useState(null);

  useEffect(() => {
    const fetchAudio = async () => {
      const audioObjectURL = await loadAudio(AUDIO_URL);
      setAudioSource(audioObjectURL);
    };

    fetchAudio();

    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => {
      window.removeEventListener("resize", updateWidth);
      if (audioSource) {
        URL.revokeObjectURL(audioSource);
      }
    };
  }, []);

  const plugins = useMemo(
    () => [
      Timeline.create({
        height: 20,
        timeInterval: 60,
        primaryLabelInterval: 300,
        secondaryLabelInterval: 150,
      }),
    ],
    []
  );

  const { wavesurfer, isPlaying, currentTime } = useWavesurfer({
    container: containerRef,
    height: 128,
    width: containerWidth,
    splitChannels: false,
    normalize: true,
    waveColor: "#ccfbf1",
    progressColor: "#5eead4",
    cursorColor: "#f66151",
    cursorWidth: 2,
    barWidth: 0.5,
    barGap: 0.5,
    barRadius: 1,
    barHeight: 1,
    minPxPerSec: 0.5,
    fillParent: true,
    url: audioSource,
    mediaControls: false,
    autoplay: true,
    interact: true,
    dragToSeek: true,
    hideScrollbar: false,
    audioRate: 1,
    sampleRate: 8000,
    plugins,
  });

  useEffect(() => {
    if (wavesurfer && spectrogramRef.current) {
      const spectrogramPlugin = Spectrogram.create({
        container: spectrogramRef.current,
        height: 512,
        colorMap: "roseus",
        minFrequency: 20,
        maxFrequency: 20000,
        splitChannels: false,
        fftSamples: 512,
        noverlap: 256,
      });
      wavesurfer.registerPlugin(spectrogramPlugin);
    }
  }, [wavesurfer]);

  const onPlayPause = useCallback(() => {
    wavesurfer && wavesurfer.playPause();
  }, [wavesurfer]);

  return (
    <div
      style={{
        width: "100%",
        padding: "20px",
        boxSizing: "border-box",
        height: "100vh",
        display: "grid",
        placeItems: "center",
      }}
    >
      <h1 style={{ margin: "0", fontSize: "42px", lineHeight: "1" }}>
        Motri - La tumba de los perros
      </h1>

      <div ref={containerRef} style={{ width: "100%" }} />
      <div ref={spectrogramRef} style={{ width: "100%" }} />

      <div
        style={{
          margin: "1em 0",
          display: "grid",
          gap: "1em",
          placeContent: "center",
          padding: "1em",
          placeItems: "center",
        }}
      >
        <div
          style={{
            fontSize: "2rem",
            textAlign: "center",
          }}
        >
          {formatTime(currentTime)}
        </div>

        <button
          onClick={onPlayPause}
          style={{
            width: "2.5em",
            height: "2.5em",
            padding: "0.5em",
            fontSize: "1.5rem",
            display: "grid",
            placeContent: "center",
            border: "none",
            borderRadius: "0.5em",
            backgroundColor: "#14b8a6",
            color: "#FFFFFF",
            cursor: "pointer",
          }}
        >
          {isPlaying ? <Pause /> : <Play />}
        </button>
      </div>
    </div>
  );
};

export default App;
