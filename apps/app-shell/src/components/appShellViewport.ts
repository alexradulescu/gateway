type ViewportPolicyInput = {
  layoutHeight: number;
  visualHeight: number;
  visualOffsetTop: number;
  visualPageTop: number;
  windowScrollY: number;
  scale: number;
  hasFocusedEditor: boolean;
};

type ViewportOverride = {
  height: number;
  offsetTop: number;
};

const KEYBOARD_CONTRACTION_RATIO = 0.2;

function resolveViewportOverride({
  layoutHeight,
  visualHeight,
  visualOffsetTop,
  visualPageTop,
  windowScrollY,
  scale,
  hasFocusedEditor,
}: ViewportPolicyInput): ViewportOverride | null {
  const contraction = layoutHeight - visualHeight;
  const keyboardIsVisible =
    hasFocusedEditor && contraction >= layoutHeight * KEYBOARD_CONTRACTION_RATIO;

  if (!keyboardIsVisible || scale > 1.01) return null;

  return {
    height: visualHeight,
    offsetTop: Math.max(0, visualOffsetTop, visualPageTop - windowScrollY),
  };
}

export { resolveViewportOverride, type ViewportPolicyInput, type ViewportOverride };
