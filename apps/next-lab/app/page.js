const ROUTES = [
  ['/isr', 'Incrementally regenerated page (revalidate: 60)'],
  ['/flags', 'Reads feature flags from the Edge Config store'],
  ['/dynamic', 'Force-dynamic server render, runs per request'],
  ['/api/hello', 'Node.js serverless function'],
  ['/api/edge', 'Edge runtime function'],
  ['/api/slow', 'Slow function — populates duration charts'],
  ['/api/error', 'Throws on purpose — populates error rate'],
  ['/proxy-health', 'next.config rewrite → /api/hello'],
  ['/old-pricing', 'Permanent redirect → /'],
];

export default function Home() {
  return (
    <section>
      <p style={{ lineHeight: 1.7 }}>
        This deployment exists so the Vercel dashboard has real data to show:
        builds, functions, logs, observability traces and cron history.
      </p>
      <p style={{ color: '#a1a1a1', fontSize: 13 }}>
        Env target: <code>{process.env.STUDY_LAB_TARGET ?? 'unset'}</code> · Region:{' '}
        <code>{process.env.VERCEL_REGION ?? 'local'}</code> · Commit:{' '}
        <code>{process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'n/a'}</code>
      </p>
      <ul style={{ lineHeight: 2, paddingLeft: 18 }}>
        {ROUTES.map(([href, label]) => (
          <li key={href}>
            <a href={href} style={{ color: '#3b82f6' }}>
              {href}
            </a>{' '}
            <span style={{ color: '#737373', fontSize: 13 }}>— {label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
