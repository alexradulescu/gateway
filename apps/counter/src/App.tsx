import { Minus, Plus, RotateCcw } from "lucide-react";
import { useState } from "react";
import { createGlobalStyle, styled } from "@alex.radulescu/styled-static";

const GlobalStyle = createGlobalStyle`
  :root {
    color: #231f20;
    background: #e9f2fb;
    font-family: ui-sans-serif, system-ui, sans-serif;
  }

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    min-width: 320px;
    min-height: 100vh;
    background:
      radial-gradient(circle at 22% 20%, #ffffff 0 90px, transparent 91px),
      linear-gradient(135deg, #e9f2fb 0 50%, #d64550 50% 51%, #e9f2fb 51%);
  }
`;

const Lab = styled.main`
  display: grid;
  min-height: 100vh;
  place-items: center;
  padding: 24px;
`;

const BackLink = styled.a`
  position: fixed;
  top: 18px;
  left: 18px;
  color: inherit;
  font-weight: 800;
  text-decoration: none;
`;

const CounterPanel = styled.section`
  width: min(520px, 100%);
  padding: 28px;
  border: 3px solid #231f20;
  background: #fff8e8;
  box-shadow: 12px 12px 0 #231f20;
  text-align: center;
`;

const Kicker = styled.p`
  margin: 0;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-weight: 900;
  text-transform: uppercase;
`;

const CountTitle = styled.h1`
  margin: 22px 0;
  font-size: clamp(6rem, 30vw, 13rem);
  line-height: 0.85;
  letter-spacing: 0;
`;

const Controls = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 64px);
  justify-content: center;
  gap: 12px;
`;

const IconButton = styled.button`
  display: grid;
  width: 64px;
  height: 64px;
  place-items: center;
  border: 2px solid #231f20;
  background: #f8c24a;
  color: #231f20;
  cursor: pointer;
  box-shadow: 4px 4px 0 #231f20;

  &:hover {
    transform: translate(-1px, -1px);
    box-shadow: 6px 6px 0 #231f20;
  }
`;

export function App() {
  const [count, setCount] = useState(0);

  return (
    <Lab>
      <GlobalStyle />
      <BackLink href="/">Gateway</BackLink>
      <CounterPanel aria-labelledby="counter-title">
        <Kicker>Counter Lab</Kicker>
        <CountTitle id="counter-title">{count}</CountTitle>
        <Controls aria-label="Counter controls">
          <IconButton
            type="button"
            onClick={() => setCount((value) => value - 1)}
            aria-label="Decrease"
          >
            <Minus size={22} />
          </IconButton>
          <IconButton type="button" onClick={() => setCount(0)} aria-label="Reset">
            <RotateCcw size={22} />
          </IconButton>
          <IconButton
            type="button"
            onClick={() => setCount((value) => value + 1)}
            aria-label="Increase"
          >
            <Plus size={22} />
          </IconButton>
        </Controls>
      </CounterPanel>
    </Lab>
  );
}
