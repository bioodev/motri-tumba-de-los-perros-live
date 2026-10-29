// import React from "react";
import P5Visualization from "./P5Visualization";
import PropTypes from "prop-types";

const AudioVisualizer = ({ analyser }) => {
  return <P5Visualization analyser={analyser} />;
};

AudioVisualizer.propTypes = {
  analyser: PropTypes.object,
};

export default AudioVisualizer;
