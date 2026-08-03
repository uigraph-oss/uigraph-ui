# Working agreements

- Do not test changes via Playwright or other automated visual/browser tests (e.g. spinning up a temporary vite harness + headless browser to screenshot components). The user will verify UI changes themselves. Rely on typecheck (`tsc --noEmit`) and lint (`eslint`) to catch issues before handing off.
