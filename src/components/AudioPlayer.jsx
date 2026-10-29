import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { useWavesurfer } from "@wavesurfer/react";
import Timeline from "wavesurfer.js/dist/plugins/timeline.esm.js";
import Spectrogram from "wavesurfer.js/dist/plugins/spectrogram.esm.js";
import { Play, Pause } from "lucide-react";
import PropTypes from "prop-types";

const WAVE_HEIGHT = 128;
const SPECTROGRAM_HEIGHT = 256;

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds)) return "00:00";
  return [seconds / 60, seconds % 60]
    .map((v) => `0${Math.floor(v)}`.slice(-2))
    .join(":");
};

const AudioPlayer = ({
  audioSource,
  onAudioContextCreation,
  onAnalyserCreation,
}) => {
  const containerRef = useRef(null);
  const spectrogramRef = useRef(null);
  const [spectrogramReady, setSpectrogramReady] = useState(false);

  // El plugin necesita su contenedor montado, así que esperamos un frame.
  useEffect(() => {
    setSpectrogramReady(true);
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

  const { wavesurfer, isPlaying, isReady, currentTime } = useWavesurfer({
    container: containerRef,
    height: WAVE_HEIGHT,
    waveColor: "#ccfbf1",
    progressColor: "#5eead4",
    cursorColor: "#f66151",
    cursorWidth: 3,
    url: audioSource,
    plugins,
    audioRate: 1,
    mediaControls: false,
    autoplay: true,
    interact: true,
    dragToSeek: true,
    hideScrollbar: false,
    fillParent: true,
    splitChannels: false,
    normalize: true,
  });

  // Espectrograma: se registra una sola vez por instancia de wavesurfer.
  const spectrogramHostRef = useRef(null);
  useEffect(() => {
    if (!wavesurfer || !spectrogramReady) return;
    if (!spectrogramRef.current) return;
    if (spectrogramHostRef.current === wavesurfer) return;

    wavesurfer.registerPlugin(
      Spectrogram.create({
        container: spectrogramRef.current,
        height: SPECTROGRAM_HEIGHT,
        colorMap: "roseus",
        minFrequency: 0,
        maxFrequency: 30000,
        splitChannels: false,
        fftSamples: 512,
        noverlap: 256,
        labels: false,
      })
    );

    spectrogramHostRef.current = wavesurfer;
  }, [wavesurfer, spectrogramReady]);

  // Analyser para el visualizador p5. Solo cuando existe el media element.
  const analyserRef = useRef(null);
  useEffect(() => {
    if (!wavesurfer) return;
    const media = wavesurfer.getMediaElement();
    if (!media || analyserRef.current) return;

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    const audioContext = new AudioCtx();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;

    const source = audioContext.createMediaElementSource(media);
    source.connect(analyser);
    source.connect(audioContext.destination);

    analyserRef.current = analyser;
    onAudioContextCreation?.(audioContext);
    onAnalyserCreation?.(analyser);

    return () => {
      source.disconnect();
      audioContext.close();
      analyserRef.current = null;
    };
  }, [wavesurfer, onAudioContextCreation, onAnalyserCreation]);

  const onPlayPause = useCallback(() => {
    if (!wavesurfer) return;
    // El AudioContext nace suspendido: hay que reanudarlo en un gesto del usuario.
    if (analyserRef.current && analyserRef.current.context.state === "suspended") {
      analyserRef.current.context.resume();
    }
    wavesurfer.playPause();
  }, [wavesurfer]);

  return (
    <div style={{ width: "95%", margin: "0 auto" }}>
      <div style={{ position: "relative" }}>
        <div ref={containerRef} style={{ width: "100%" }} />
        {!isReady && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              color: "#5eead4",
              fontSize: "1.1rem",
              letterSpacing: "0.05em",
              pointerEvents: "none",
            }}
          >
            Decodificando audio…
          </div>
        )}
      </div>
      <div
        ref={spectrogramRef}
        style={{ width: "100%", height: `${SPECTROGRAM_HEIGHT}px` }}
      />
      <div
        style={{
          margin: "1em 0",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ fontSize: "2rem", marginRight: "1em" }}>
          {formatTime(currentTime)}
        </div>
        <button
          onClick={onPlayPause}
          aria-label={isPlaying ? "Pausar" : "Reproducir"}
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

AudioPlayer.propTypes = {
  audioSource: PropTypes.string,
  onAudioContextCreation: PropTypes.func,
  onAnalyserCreation: PropTypes.func,
};
export default AudioPlayer;
