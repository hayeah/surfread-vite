import { makeAutoObservable } from "mobx";

export function createTimer() {
  return makeAutoObservable({
    secondsPassed: 0,
    increase() {
      this.secondsPassed += 2;
    },
    reset() {
      this.secondsPassed = 0;
    }
  });
}

// Create a singleton instance of the timer
export const timerStore = createTimer();

// Auto-increment the timer every second
setInterval(() => {
  timerStore.increase();
}, 1000);
