# motri-js-audio

Reproductor de audio en el navegador para *Motri — La tumba de los perros*.

- **Stack:** React 18 + Vite 6, `wavesurfer.js` (onda + espectrograma + timeline), `lucide-react`.
- **Audio:** `public/audio/audio.m4a`, cacheado en el navegador con IndexedDB la primera vez.
- **Estado:** reproductor funcionando (onda, espectrograma, timeline, play/pausa). El visualizador p5 está escrito pero desactivado.

## Uso

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run preview
```

## Estructura

```
src/
├── App.jsx                     # carga el audio una vez y monta el reproductor
├── components/
│   ├── AudioPlayer.jsx         # wavesurfer: onda, espectrograma, timeline, controles
│   ├── AudioVisualizer.jsx     # envoltorio del visualizador
│   └── P5Visualization.jsx     # barras de frecuencia con p5 (no montado)
└── utils/audioUtils.js         # fetch + caché del audio en IndexedDB
```

## Notas

- El audio son ~23 MB: la primera carga descarga y decodifica; después sale de IndexedDB.
- No se fija `sampleRate` en wavesurfer (resampleaba el audio y alargaba la decodificación).
- El `AudioContext` para el analyser se reanuda con el clic de play (los navegadores lo crean suspendido).
