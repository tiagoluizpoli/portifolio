declare module 'commander' {
  export interface OutputConfiguration {
    writeOut?: (str: string) => void;
    writeErr?: (str: string) => void;
    outputError?: (str: string, write: (str: string) => void) => void;
  }

  export class InvalidArgumentError extends Error {
    constructor(message: string);
    code: string;
  }

  export class Command {
    name(name: string): this;
    allowUnknownOption(allowUnknown?: boolean): this;
    allowExcessArguments(allowExcess?: boolean): this;
    configureOutput(configuration: OutputConfiguration): this;
    exitOverride(): this;
    option(flags: string, description?: string): this;
    parse(
      argv: string[],
      options?: { from?: 'node' | 'electron' | 'user' },
    ): this;
    opts<T extends Record<string, unknown> = Record<string, unknown>>(): T;
  }
}
