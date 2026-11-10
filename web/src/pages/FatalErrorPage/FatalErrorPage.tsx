const FatalErrorPage = () => {
  return (
    <main className="flex h-screen w-full items-center justify-center bg-[#0A1A3C] px-6 text-center font-sans">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            html, body {
              margin: 0;
              padding: 0;
              background-color: #0A1A3C;
            }
            html * {
              box-sizing: border-box;
            }
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.6; }
            }
          `,
        }}
      />

      <div className="flex w-full max-w-sm flex-col items-center">
        <div
          className="mb-6 h-12 w-12 rounded-full border-4 border-white/20 border-t-[#2F80ED]"
          style={{ animation: 'spin 1s linear infinite' }}
        />

        <h1 className="text-4xl font-black tracking-tight">
          <span className="text-[#38BDF8]">VI</span>
          <span className="text-white">REON</span>
        </h1>

        <p
          className="mt-4 text-sm font-medium text-white/80"
          style={{ animation: 'pulse 1.6s ease-in-out infinite' }}
        >
          Please wait a moment...
        </p>

        <p className="mt-1 text-xs text-white/40">
          Something went wrong. Reloading shortly.
        </p>

        <button
          onClick={() => window.location.reload()}
          className="mt-6 rounded-full bg-[#2F80ED] px-6 py-2.5 text-sm font-black text-white transition active:scale-95"
        >
          Reload page
        </button>
      </div>
    </main>
  )
}

export default FatalErrorPage
