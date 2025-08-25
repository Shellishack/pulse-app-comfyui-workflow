import React, { useEffect, useState } from "react";
import "./tailwind.css";
import config from "../pulse.config";
import { useLoading } from "@pulse-editor/react-api";
import { WrappedHeroUIProvider } from "./components/providers/wrapped-hero-ui-provider";
import Service from "./components/service/service";
import Workflow from "./components/workflow/worflow";
export const Config = config;

export default function Main() {
  const [viewMode, setViewMode] = useState<"service" | "workflow">("service");

  // const { isReady, toggleLoading } = useLoading();

  // useEffect(() => {
  //   if (isReady) {
  //     toggleLoading(false);
  //   }
  // }, [isReady, toggleLoading]);

  function toggleViewMode() {
    if (viewMode === "service") {
      setViewMode("workflow");
    } else {
      setViewMode("service");
    }
  }

  return (
    <WrappedHeroUIProvider>
      <div className="w-full h-full p-2 overflow-x-hidden">
        {viewMode === "service" ? (
          <div className="w-full h-full">
            <Service toggleViewMode={toggleViewMode} />
          </div>
        ) : (
          <div className="w-full h-full">
            <Workflow toggleViewMode={toggleViewMode} />
          </div>
        )}
      </div>
    </WrappedHeroUIProvider>
  );
}
