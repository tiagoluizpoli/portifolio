export type Fields = Record<string, unknown>;
export type Logger = {
  info(message: string, fields?: Fields): void;
  warn(message: string, fields?: Fields): void;
  error(message: string, fields?: Fields): void;
};

/** Errors keep name+message only: stacks and causes can carry request headers (tokens). */
function plain(value: unknown): unknown {
  return value instanceof Error ? { name: value.name, message: value.message } : value;
}

/** One JSON object per line on stdout. */
export function createLogger(write: (line: string) => void = (line) => process.stdout.write(`${line}\n`)): Logger {
  const at =
    (level: string) =>
    (message: string, fields: Fields = {}) =>
      write(
        JSON.stringify({
          time: new Date().toISOString(),
          ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, plain(v)])),
          level,
          message,
        }),
      );
  return { info: at('info'), warn: at('warn'), error: at('error') };
}

export const logger = createLogger();
