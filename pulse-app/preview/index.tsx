import React from "react";
import ReactDOM from "react-dom/client";
import Main from "../src/main";

function Preview() {
  return <Main />;
}

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(<Preview />);
