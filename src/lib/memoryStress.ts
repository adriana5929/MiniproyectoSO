/**
 * Arreglo global donde se almacenan bloques
 * para mantener memoria ocupada.
 */
const memoryBlocks: number[][] = [];

/**
 * Reserva memoria RAM creando un arreglo grande
 * y almacenándolo en memoryBlocks.
 */
export function consumeMemory(size: number = 500000): number {
  const block = Array.from(
    { length: size },
    () => Math.random()
  );

  memoryBlocks.push(block);

  return memoryBlocks.length;
}

/**
 * Devuelve cuántos bloques están almacenados.
 */
export function getMemoryBlocksCount(): number {
  return memoryBlocks.length;
}

/**
 * Libera toda la memoria ocupada por los bloques.
 */
export function clearMemory(): void {
  memoryBlocks.length = 0;
}
