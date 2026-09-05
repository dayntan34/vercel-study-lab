import React, { useState } from 'react';

const TABS = {
  overview: (
    <>
      <p>
        A client-rendered single page app. Vercel detects Vite from{' '}
        <code>package.json</code>, runs <code>vite build</code>, and serves{' '}
        <code>dist/</code> as static assets.
      </p>
      <p className="sub">
        Because routing happens in the browser, this project needs a rewrite so
        deep links do not 404. See <code>vercel.json</code>.
      </p>
    </>
  ),
  build: (
    <>
      <p>
        Build config asks Vite for sourcemaps and a manifest, which makes the
        deployment's output listing more interesting to browse.
      </p>
      <p className="sub">
        Compare the build duration here against <code>static-lab</code> (no
        build) and <code>next-lab</code> (framework build).
      </p>
    </>
  ),
  env: (
    <>
      <p>
        Vite only exposes variables prefixed with <code>VITE_</code> to client
        code. This one is baked in at build time:
      </p>
      <p>
        <code>VITE_LAB_LABEL = {import.meta.env.VITE_LAB_LABEL ?? 'unset'}</code>
      </p>
      <p className="sub">
        Changing it in project settings requires a redeploy to take effect,
        unlike a server-side variable.
      </p>
    </>
  ),
};

export default function App() {
  const [tab, setTab] = useState('overview');

  return (
    <div className="wrap">
      <h1 style={{ fontSize: 24, margin: '0 0 4px' }}>vite-lab</h1>
      <p className="sub">Vercel Study Lab · Vite + React SPA</p>

      <nav>
        {Object.keys(TABS).map((key) => (
          <button
            key={key}
            aria-current={tab === key}
            onClick={() => setTab(key)}
          >
            {key}
          </button>
        ))}
      </nav>

      <section>{TABS[tab]}</section>
    </div>
  );
}
