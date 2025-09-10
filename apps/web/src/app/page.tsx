export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Welcome to ZERGO QR
        </h1>
        <p className="text-center text-lg mb-4">
          Restaurant QR Code Ordering System
        </p>
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Monorepo setup complete with Next.js 14, TypeScript 5.2, and Turborepo
          </p>
        </div>
      </div>
    </main>
  )
}
