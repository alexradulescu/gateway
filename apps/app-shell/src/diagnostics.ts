import { useEffect, useLayoutEffect, useState } from "react";

type Insets = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

type ViewportSnapshot = {
  screenHeight: number;
  layoutWidth: number;
  layoutHeight: number;
  visualWidth: number;
  visualHeight: number;
  scale: number;
  orientation: string;
  standalone: boolean;
  appleStandalone: boolean;
};

type NavigatorWithStandalone = Navigator & {
  standalone?: boolean;
};

function getViewportSnapshot(): ViewportSnapshot {
  const visualViewport = window.visualViewport;
  const displayModeStandalone = window.matchMedia("(display-mode: standalone)").matches;
  const appleStandalone = Boolean((navigator as NavigatorWithStandalone).standalone);

  return {
    screenHeight: window.screen.height,
    layoutWidth: window.innerWidth,
    layoutHeight: window.innerHeight,
    visualWidth: visualViewport?.width ?? window.innerWidth,
    visualHeight: visualViewport?.height ?? window.innerHeight,
    scale: visualViewport?.scale ?? 1,
    orientation: window.screen.orientation?.type ?? "portrait",
    standalone: displayModeStandalone || appleStandalone,
    appleStandalone,
  };
}

function useViewportSnapshot() {
  const [snapshot, setSnapshot] = useState(getViewportSnapshot);

  useEffect(() => {
    const update = () => setSnapshot(getViewportSnapshot());
    const visualViewport = window.visualViewport;
    const standaloneQuery = window.matchMedia("(display-mode: standalone)");

    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    visualViewport?.addEventListener("resize", update);
    visualViewport?.addEventListener("scroll", update);
    standaloneQuery.addEventListener("change", update);

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      visualViewport?.removeEventListener("resize", update);
      visualViewport?.removeEventListener("scroll", update);
      standaloneQuery.removeEventListener("change", update);
    };
  }, []);

  return snapshot;
}

function useSafeAreaInsets() {
  const [insets, setInsets] = useState<Insets>({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  useLayoutEffect(() => {
    const probe = document.createElement("div");
    probe.setAttribute("aria-hidden", "true");
    Object.assign(probe.style, {
      position: "fixed",
      inset: "0",
      zIndex: "-1",
      visibility: "hidden",
      pointerEvents: "none",
      paddingTop: "env(safe-area-inset-top, 0px)",
      paddingRight: "env(safe-area-inset-right, 0px)",
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
      paddingLeft: "env(safe-area-inset-left, 0px)",
    });
    document.body.append(probe);

    const update = () => {
      const computed = getComputedStyle(probe);
      setInsets({
        top: Number.parseFloat(computed.paddingTop) || 0,
        right: Number.parseFloat(computed.paddingRight) || 0,
        bottom: Number.parseFloat(computed.paddingBottom) || 0,
        left: Number.parseFloat(computed.paddingLeft) || 0,
      });
    };

    update();
    const visualViewport = window.visualViewport;
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    visualViewport?.addEventListener("resize", update);

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      visualViewport?.removeEventListener("resize", update);
      probe.remove();
    };
  }, []);

  return insets;
}

export { useSafeAreaInsets, useViewportSnapshot };
