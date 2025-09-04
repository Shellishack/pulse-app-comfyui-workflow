/* This folder contains temporary code to be moved to a different package in the future. */
import React from "react";
import ReactDOM from "react-dom/client";
import Main from "../../src/main";

function Preview() {
  return <Main />;
}

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(<Preview />);
