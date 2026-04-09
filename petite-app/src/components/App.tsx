"use client";

import { useEffect } from "react";
import { useMiniApp } from "@neynar/react";
import Game from "~/components/Game";

export interface AppProps {
  title?: string;
}

export default function App(
  { title }: AppProps = { title: "Neynar Starter Kit" }
) {
  const {
    isSDKLoaded,
    context,
    setInitialTab,
  } = useMiniApp();

  useEffect(() => {
    if (isSDKLoaded) {
      setInitialTab("home");
    }
  }, [isSDKLoaded, setInitialTab]);

  if (!isSDKLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="spinner h-8 w-8 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        paddingTop: context?.client.safeAreaInsets?.top ?? 0,
        paddingBottom: context?.client.safeAreaInsets?.bottom ?? 0,
        paddingLeft: context?.client.safeAreaInsets?.left ?? 0,
        paddingRight: context?.client.safeAreaInsets?.right ?? 0,
      }}
    >
      <Game />
    </div>
  );
}
