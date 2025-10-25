import React from 'react'

export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-2xl w-full px-6 py-12">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Solo Pro</h1>
          <p className="mt-2 text-sm text-slate-500">
            Your Vite + React + Tailwind local build (replaces CDN).
          </p>
        </header>

        <main className="bg-slate-50 border border-slate-100 rounded-lg p-6 shadow-sm">
          <p className="text-slate-700">
            This app uses Tailwind compiled locally (PostCSS + Autoprefixer). Visuals using Tailwind utility classes remain identical to the CDN version.
          </p>

          <div className="mt-6 flex gap-3">
            <button className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700 transition">
              Primary action
            </button>
            <button className="px-4 py-2 rounded border border-slate-200 text-slate-700 hover:bg-slate-100 transition">
              Secondary
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}