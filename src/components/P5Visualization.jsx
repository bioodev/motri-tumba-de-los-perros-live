import { useRef, useEffect } from "react";
import PropTypes from "prop-types";
import p5 from "p5";

const P5Visualization = ({ analyser }) => {
  const sketchRef = useRef();
  const p5InstanceRef = useRef(null);

  useEffect(() => {
    if (!analyser) return;

    if (!p5InstanceRef.current) {
      console.log("Creating new p5 instance");
      p5InstanceRef.current = new p5((p) => {
        p.setup = () => {
          console.log("P5 setup");
          p.createCanvas(400, 200);
        };

        p.draw = () => {
          p.background(220);

          let spectrum = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(spectrum);

          p.noStroke();
          p.fill(0, 255, 0);

          for (let i = 0; i < spectrum.length; i++) {
            let x = p.map(i, 0, spectrum.length, 0, p.width);
            let h = p.map(spectrum[i], 0, 255, 0, p.height);
            p.rect(x, p.height, p.width / spectrum.length, -h);
          }
        };
      }, sketchRef.current);
    }

    return () => {
      if (p5InstanceRef.current) {
        console.log("Removing p5 instance");
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
    };
  }, [analyser]);

  return <div ref={sketchRef}></div>;
};

P5Visualization.propTypes = {
  analyser: PropTypes.object,
};

export default P5Visualization;
