export function calculatePrimes(limit: number) {
  let count = 0;

  for (let i = 2; i < limit; i++) {
    let isPrime = true;

    for (let j = 2; j * j <= i; j++) {
      if (i % j === 0) {
        isPrime = false;
        break;
      }
    }

    if (isPrime) {
      count++;
    }
  }

  return count;
}

export function fibonacci(n: number): number {
  if (n <= 1) {
    return n;
  }

  return fibonacci(n - 1) + fibonacci(n - 2);
}

export function sortLargeArray() {
  const arr = Array.from(
    { length: 100000 },
    () => Math.random()
  );

  arr.sort();

  return arr.length;
}

export function multiplyMatrices(size: number) {
  const a = Array.from(
    { length: size },
    () =>
      Array.from(
        { length: size },
        () => Math.random()
      )
  );

  const b = Array.from(
    { length: size },
    () =>
      Array.from(
        { length: size },
        () => Math.random()
      )
  );

  const result =
    Array.from(
      { length: size },
      () => Array(size).fill(0)
    );

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      for (let k = 0; k < size; k++) {
        result[i][j] +=
          a[i][k] * b[k][j];
      }
    }
  }

  return result[0][0];
}
