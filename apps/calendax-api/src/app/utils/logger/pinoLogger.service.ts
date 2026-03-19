import { ConsoleLogger, Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class PinoLoggerService extends ConsoleLogger {
  readonly contextName: string;

  constructor(readonly logger: PinoLogger) {
    super();
    this.contextName = 'context';
  }

  override setContext(name: string) {
    this.logger?.setContext(name);
  }

  // verbose(message: any, context?: string, ...args: any[]) {
  //   if (context) {
  //     this.logger.trace({ [this.contextName]: context }, message);
  //   } else {
  //     this.logger.verbose(message, ...args);
  //   }
  // }

  override debug(message: any, context?: string, ...args: any[]) {
    if (context) {
      this.logger.debug({ [this.contextName]: context }, message);
    } else {
      this.logger.debug(message, ...args);
    }
  }

  override log(message: any, context?: string, ...args: any[]) {
    if (context) {
      this.logger.info({ [this.contextName]: context }, message);
    } else {
      this.logger.info(message, ...args);
    }
  }

  info(message: any, context?: string, ...args: any[]) {
    if (context) {
      this.logger.info({ [this.contextName]: context }, message);
    } else {
      this.logger.info(message, ...args);
    }
  }

  override warn(message: any, context?: string, ...args: any[]) {
    if (context) {
      this.logger.warn({ [this.contextName]: context }, message);
    } else {
      this.logger.warn(message, ...args);
    }
  }

  override error(message: any, trace?: unknown, context?: string, ...args: any[]) {
    let details: Record<string, string> = { trace: '', context: '' };

    if (context) {
      details[this.contextName] = context;
    }

    if (trace) {
      details.trace = (trace instanceof Error && trace.message) ? trace.message : JSON.stringify(trace, null, 2);
    }

    this.logger.error(
      details,
      message,
      ...args
    );
  }
}
