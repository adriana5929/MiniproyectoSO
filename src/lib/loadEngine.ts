import { calculatePrimes } from "./cpuStress";
import { consumeMemory } from "./memoryStress";
import { databaseStress } from "./dbStress";

let running = false;

export async function startLoad() {
  running = true;

  while (running) {
    const tasks = [];

    for (let i = 0; i < 100; i++) {
      tasks.push(
        (async () => {
          calculatePrimes(30000);

          consumeMemory();

          await databaseStress();
        })()
      );
    }

    await Promise.all(tasks);

    await new Promise(resolve =>
      setTimeout(resolve, 1000)
    );
  }
}

export function stopLoad() {
  running = false;
}

export async function extremeLoad() {
  const tasks = [];

  for (let i = 0; i < 500; i++) {
    tasks.push(
      (async () => {
        for (let j = 0; j < 50; j++) {
          calculatePrimes(50000);

          consumeMemory();

          await databaseStress();
        }
      })()
    );
  }

  await Promise.all(tasks);
}
