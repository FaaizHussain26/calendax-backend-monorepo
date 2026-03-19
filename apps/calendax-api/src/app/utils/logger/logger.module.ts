import { Global, Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { stdTimeFunctions } from 'pino';

import { PinoLoggerService } from './pinoLogger.service'

declare module 'http' {
  interface IncomingMessage {
    requestId: string;
  }
}

function generateRandom5DigitNumber() {
  const crypto = require('crypto');
  const randomNumber = crypto.randomBytes(4).readUInt32BE(0);

  const randomFiveDigit = randomNumber % 90000 + 10000;

  return randomFiveDigit;
}

// const logLevel = process.env.NODE_ENV === 'development' ? 'debug' : 'warn';

@Global()
@Module({
  imports: [
    PinoLoggerModule.forRoot({
      pinoHttp: {
        name: 'Application',
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
        genReqId: (req) => req.requestId || generateRandom5DigitNumber(),
        formatters: {
          bindings: () => ({})
        },
        serializers: {
          req: (req) => ({
            id: req.id,
            method: req.method,
            url: req.url,
            query: req.query
          }),
        },
        timestamp: stdTimeFunctions.unixTime,
        transport: {
          targets: [
            {
              target: 'pino-pretty',
              options: {
                singleLine: true,
              }
            },
        
          ]
        }
      },
    }),
  ],
  providers: [PinoLoggerService],
  exports: [PinoLoggerService],
})
export class LoggerModule { }
