import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import webfontDownload from "vite-plugin-webfont-dl";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    webfontDownload(
      [
        "https://fonts.googleapis.com/css2?family=Silkscreen:wght@400;700&display=swap",
      ],
      {
        injectAsStyleTag: true,
        minifyCss: true,
        embedFonts: false,
        async: true,
        cache: true,
        proxy: false,
        assetsSubfolder: "",
      }
    ),
  ],
});
