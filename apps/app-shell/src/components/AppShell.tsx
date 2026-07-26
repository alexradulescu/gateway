"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ComponentProps,
  type CSSProperties,
  type Ref,
} from "react";
import "./app-shell.css";

const MINIMUM_BAR_HEIGHT = 48;

type RegionElement = HTMLElement | null;

type AppShellContextValue = {
  setHeaderElement: (element: RegionElement) => void;
  setFooterElement: (element: RegionElement) => void;
};

const AppShellContext = createContext<AppShellContextValue | null>(null);

let documentLockCount = 0;
let restoreDocumentLock: (() => void) | undefined;

function acquireDocumentLock() {
  documentLockCount += 1;
  if (documentLockCount > 1) return;

  const root = document.documentElement;
  const body = document.body;
  const previous = {
    rootOverflow: root.style.overflow,
    rootOverscrollBehavior: root.style.overscrollBehavior,
    bodyOverflow: body.style.overflow,
    bodyOverscrollBehavior: body.style.overscrollBehavior,
  };

  root.style.overflow = "hidden";
  root.style.overscrollBehavior = "none";
  body.style.overflow = "hidden";
  body.style.overscrollBehavior = "none";

  restoreDocumentLock = () => {
    root.style.overflow = previous.rootOverflow;
    root.style.overscrollBehavior = previous.rootOverscrollBehavior;
    body.style.overflow = previous.bodyOverflow;
    body.style.overscrollBehavior = previous.bodyOverscrollBehavior;
  };
}

function releaseDocumentLock() {
  documentLockCount = Math.max(0, documentLockCount - 1);
  if (documentLockCount !== 0) return;

  restoreDocumentLock?.();
  restoreDocumentLock = undefined;
}

function useMeasuredHeight(element: RegionElement) {
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    if (!element) {
      setHeight(0);
      return;
    }

    const updateHeight = () => {
      setHeight(Math.ceil(element.getBoundingClientRect().height));
    };

    updateHeight();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateHeight);
      return () => window.removeEventListener("resize", updateHeight);
    }

    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);

  return height;
}

function useVisualViewport(element: HTMLDivElement | null) {
  useLayoutEffect(() => {
    if (!element) return;

    let animationFrame = 0;
    let settleTimer = 0;

    const updateViewport = () => {
      const viewport = window.visualViewport;
      const isPinchZoomed = viewport ? viewport.scale > 1.01 : false;
      const height = viewport && !isPinchZoomed ? viewport.height : window.innerHeight;
      const pageOffset = viewport ? viewport.pageTop - window.scrollY : 0;
      const offsetTop =
        viewport && !isPinchZoomed ? Math.max(0, viewport.offsetTop, pageOffset) : 0;

      element.style.setProperty("--app-shell-viewport-height", `${height}px`);
      element.style.setProperty("--app-shell-viewport-offset-top", `${offsetTop}px`);
    };

    const scheduleViewportUpdate = () => {
      updateViewport();
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(settleTimer);
      animationFrame = window.requestAnimationFrame(updateViewport);
      settleTimer = window.setTimeout(updateViewport, 80);
    };

    scheduleViewportUpdate();

    const viewport = window.visualViewport;
    window.addEventListener("resize", scheduleViewportUpdate);
    window.addEventListener("orientationchange", scheduleViewportUpdate);
    viewport?.addEventListener("resize", scheduleViewportUpdate);
    viewport?.addEventListener("scroll", scheduleViewportUpdate);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(settleTimer);
      window.removeEventListener("resize", scheduleViewportUpdate);
      window.removeEventListener("orientationchange", scheduleViewportUpdate);
      viewport?.removeEventListener("resize", scheduleViewportUpdate);
      viewport?.removeEventListener("scroll", scheduleViewportUpdate);
    };
  }, [element]);
}

function useAppShellContext(componentName: string) {
  const context = useContext(AppShellContext);

  if (!context) {
    throw new Error(`${componentName} must be rendered inside AppShell.`);
  }

  return context;
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}

function useRegionRef<T extends HTMLElement>(
  register: (element: T | null) => void,
  forwardedRef: Ref<T> | undefined,
) {
  return useCallback(
    (element: T | null) => {
      register(element);
      assignRef(forwardedRef, element);
    },
    [forwardedRef, register],
  );
}

type AppShellStyle = CSSProperties & {
  "--app-shell-header-height"?: string;
  "--app-shell-footer-height"?: string;
};

function AppShell({ children, ref, style, ...props }: ComponentProps<"div">) {
  const [shellElement, setShellElement] = useState<HTMLDivElement | null>(null);
  const [headerElement, setHeaderElement] = useState<RegionElement>(null);
  const [footerElement, setFooterElement] = useState<RegionElement>(null);
  const headerHeight = useMeasuredHeight(headerElement);
  const footerHeight = useMeasuredHeight(footerElement);
  const setShellRef = useRegionRef(setShellElement, ref);

  useLayoutEffect(() => {
    acquireDocumentLock();
    return releaseDocumentLock;
  }, []);

  useVisualViewport(shellElement);

  const context = useMemo(
    () => ({ setHeaderElement, setFooterElement }),
    [setHeaderElement, setFooterElement],
  );

  const shellStyle: AppShellStyle = {
    ...style,
    "--app-shell-header-height": `${headerHeight}px`,
    "--app-shell-footer-height": `${footerHeight}px`,
  };

  return (
    <AppShellContext value={context}>
      <div
        {...props}
        ref={setShellRef}
        data-slot="app-shell"
        data-has-header={headerElement ? true : undefined}
        data-has-footer={footerElement ? true : undefined}
        style={shellStyle}
      >
        {children}
        <div data-slot="app-shell-unsafe-guard" data-side="top" aria-hidden="true" />
        <div data-slot="app-shell-unsafe-guard" data-side="bottom" aria-hidden="true" />
        <div data-slot="app-shell-edge-fade" data-side="top" aria-hidden="true" />
        <div data-slot="app-shell-edge-fade" data-side="bottom" aria-hidden="true" />
      </div>
    </AppShellContext>
  );
}

function AppHeader({ ref, ...props }: ComponentProps<"header">) {
  const { setHeaderElement } = useAppShellContext("AppHeader");
  const setRef = useRegionRef(setHeaderElement, ref);

  return <header {...props} ref={setRef} data-slot="app-header" />;
}

function AppBody({ ref, ...props }: ComponentProps<"main">) {
  useAppShellContext("AppBody");
  return <main {...props} ref={ref} data-slot="app-body" />;
}

function AppFooter({ ref, ...props }: ComponentProps<"footer">) {
  const { setFooterElement } = useAppShellContext("AppFooter");
  const setRef = useRegionRef(setFooterElement, ref);

  return <footer {...props} ref={setRef} data-slot="app-footer" />;
}

export { AppBody, AppFooter, AppHeader, AppShell, MINIMUM_BAR_HEIGHT };
