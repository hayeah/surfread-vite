import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div className="mx-auto max-w-screen-lg p-8 text-center">
        <div className="flex justify-center gap-8">
          <a href="https://vite.dev" target="_blank" rel="noopener noreferrer">
            <img
              src={viteLogo}
              className="h-24 transition-[filter] duration-300 hover:drop-shadow-[0_0_2em_#646cffaa]"
              alt="Vite logo"
            />
          </a>

          <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
            <img
              src={reactLogo}
              className="h-24 transition-[filter] duration-300 hover:drop-shadow-[0_0_2em_#61dafbaa] motion-safe:animate-spin-slow"
              alt="React logo"
            />
          </a>
        </div>

        <h1 className="mt-8 text-5xl font-bold">React</h1>

        <div className="mt-6 rounded-lg bg-neutral-100 p-8">
          <button
            onClick={() => setCount((c) => c + 1)}
            className="rounded-lg border border-transparent bg-indigo-600 px-6 py-3 text-lg font-medium transition-colors hover:bg-indigo-500 focus:outline-none focus-visible:ring focus-visible:ring-indigo-300"
          >
            count is {count}
          </button>

          <p className="mt-4 text-sm text-neutral-400">
            Edit <code className="text-indigo-400">src/App.tsx</code> and save
            to test HMR
          </p>
        </div>

        <p className="mt-6 text-neutral-500">
          Click on the Vite and React logos to learn more
        </p>
      </div>
    </>
  );
}

export default App;
