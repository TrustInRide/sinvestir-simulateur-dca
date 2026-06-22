"use client";

import { useEffect } from "react";

export function EmbedHeightReporter() {
  useEffect(() => {
    const send = () => {
      window.parent.postMessage(
        {
          type: "simulateur-crypto-resize",
          height: document.documentElement.scrollHeight,
        },
        "*",
      );
    };

    send();

    const observer = new ResizeObserver(send);
    observer.observe(document.documentElement);

    return () => observer.disconnect();
  }, []);

  return null;
}
