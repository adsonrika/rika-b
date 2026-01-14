export const serializeError = (error: Error) => {
  if (!error) {
    return '';
  }

  const { name, message, stack } = error;
  return JSON.stringify({
    name,
    message,
    stack,
  });
};
