/**
 * StartupErrorInterceptor — Static diagnostic screen for env validation failures.
 *
 * FR-011: Intercepts missing/invalid environment variables and renders a static
 * diagnostic screen instead of crashing the Node.js process with a 502 Bad Gateway.
 *
 * This component is intentionally dependency-free (no shadcn/ui imports) so it
 * can be rendered even if the router/provider tree has not mounted.
 */

interface StartupErrorInterceptorProps {
  /**
   * The ZodError or generic error thrown during env validation, serialized as a
   * plain object (so it can cross the server→client boundary safely).
   */
  errors: Record<string, string[]>;
}

export function StartupErrorInterceptor({
  errors,
}: StartupErrorInterceptorProps) {
  const fields = Object.entries(errors);

  return (
    <div
      id="startup-error-interceptor"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#09090b',
        fontFamily:
          '"Inter", "SF Pro Display", ui-sans-serif, system-ui, sans-serif',
        color: '#fafafa',
        padding: '2rem',
      }}
    >
      <div
        style={{
          maxWidth: '560px',
          width: '100%',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: '1rem',
          background: 'rgba(239,68,68,0.05)',
          padding: '2.5rem',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem',
          }}
        >
          <div
            style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '0.5rem',
              background: 'rgba(239,68,68,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              flexShrink: 0,
            }}
          >
            ⚠
          </div>
          <div>
            <p
              style={{
                fontSize: '0.625rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: 'rgba(239,68,68,0.8)',
                marginBottom: '0.125rem',
              }}
            >
              Startup Configuration Error
            </p>
            <h1
              style={{
                fontSize: '1.125rem',
                fontWeight: 700,
                color: '#fafafa',
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Zenith cannot start
            </h1>
          </div>
        </div>

        {/* Description */}
        <p
          style={{
            fontSize: '0.875rem',
            color: 'rgba(250,250,250,0.6)',
            lineHeight: 1.6,
            marginBottom: '1.5rem',
          }}
        >
          The following required environment variables are missing or invalid.
          Correct your{' '}
          <code
            style={{
              color: 'rgba(250,250,250,0.9)',
              background: 'rgba(255,255,255,0.06)',
              padding: '0.125rem 0.375rem',
              borderRadius: '0.25rem',
              fontSize: '0.8125rem',
            }}
          >
            .env
          </code>{' '}
          file and restart the server.
        </p>

        {/* Error list */}
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}
        >
          {fields.map(([key, messages]) => (
            <div
              key={key}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
                padding: '0.75rem 1rem',
                background: 'rgba(239,68,68,0.08)',
                borderRadius: '0.5rem',
                border: '1px solid rgba(239,68,68,0.12)',
              }}
            >
              <span
                style={{
                  fontFamily:
                    '"JetBrains Mono", "Fira Code", ui-monospace, monospace',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: 'rgba(239,68,68,0.9)',
                }}
              >
                {key}
              </span>
              {messages.map((msg) => (
                <span
                  key={msg}
                  style={{
                    fontSize: '0.75rem',
                    color: 'rgba(250,250,250,0.5)',
                  }}
                >
                  {msg}
                </span>
              ))}
            </div>
          ))}
        </div>

        {/* Footer */}
        <p
          style={{
            marginTop: '1.5rem',
            fontSize: '0.75rem',
            color: 'rgba(250,250,250,0.3)',
            textAlign: 'center',
          }}
        >
          HTTP 503 · Zenith Administrative Shell
        </p>
      </div>
    </div>
  );
}
