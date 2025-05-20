import { useState } from "react";

import { Button } from "@/components/ui/button";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex justify-center items-center h-screen w-full">
      <div className="text-center">
        <div>
          <Button onClick={() => setCount((c) => c + 1)}>
            count is {count}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default App;
