import '@testing-library/jest-dom/vitest'

// jsdom doesn't implement ResizeObserver, but recharts' ResponsiveContainer
// (used by the Insights trend chart) requires it to be defined.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver ??= ResizeObserverStub
