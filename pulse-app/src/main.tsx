import React, { useEffect, useState } from "react";
import "./tailwind.css";
import config from "../pulse.config";
import { useLoading } from "@pulse-editor/react-api";
import { WrappedHeroUIProvider } from "./components/providers/wrapped-hero-ui-provider";
import { Button } from "@heroui/react";
import Icon from "./components/utils/icon";

export const Config = config;

export default function Main() {
  const [count, setCount] = useState<number>(0);
  // const { isReady, toggleLoading } = useLoading();

  // useEffect(() => {
  //   if (isReady) {
  //     toggleLoading(false);
  //   }
  // }, [isReady, toggleLoading]);

  return (
    <WrappedHeroUIProvider>
      <div className="p-2">
        <Button onPress={() => setCount(count + 1)}>
          <Icon name="search" />
          Test
        </Button>
        <p className="text-blue-400">{count}</p>
      </div>
    </WrappedHeroUIProvider>
  );
}
