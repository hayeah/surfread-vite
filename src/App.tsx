import { observer } from "mobx-react-lite"
import { Button } from "@/components/ui/button"
import { timerStore } from "./store/timerStore"

const App = observer(() => {
  return (
    <div className="flex justify-center items-center h-screen w-full">
      <div className="text-center">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold">MobX Timer!!!</h1>
          <div className="text-lg">Seconds passed: {timerStore.secondsPassed}</div>
          <Button onClick={() => timerStore.reset()}>Reset</Button>
        </div>
      </div>
    </div>
  )
})

export default App
