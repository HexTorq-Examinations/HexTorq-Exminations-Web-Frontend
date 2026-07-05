export const simulateDelay = (ms: number = 800): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const withDelay = async <T>(data: T, ms: number = 800): Promise<T> => {
  await simulateDelay(ms);
  return data;
};
