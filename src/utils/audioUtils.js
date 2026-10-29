import { openDB } from "idb";

const DB_NAME = "audioDB";
const STORE_NAME = "audioFiles";
const AUDIO_KEY = "currentAudio";

const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME);
    },
  });
};

export const loadAudio = async (url) => {
  const db = await initDB();
  let audioBlob = await db.get(STORE_NAME, AUDIO_KEY);

  if (!audioBlob) {
    const response = await fetch(url);
    audioBlob = await response.blob();
    await db.put(STORE_NAME, audioBlob, AUDIO_KEY);
  }

  return URL.createObjectURL(audioBlob);
};
