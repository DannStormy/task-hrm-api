import { LoggerService, Injectable, LogLevel } from '@nestjs/common';

@Injectable()
export class CustomLoggerService implements LoggerService {
    private context?: string;
    private static logLevels: LogLevel[] = ['log', 'error', 'warn', 'debug', 'verbose'];

    log(message: any, context?: string) {
        this.printMessage('log', message, context);
    }

    error(message: any, trace?: string, context?: string) {
        this.printMessage('error', message, context, trace);
    }

    warn(message: any, context?: string) {
        this.printMessage('warn', message, context);
    }

    debug(message: any, context?: string) {
        this.printMessage('debug', message, context);
    }

    verbose(message: any, context?: string) {
        this.printMessage('verbose', message, context);
    }

    private printMessage(level: LogLevel, message: any, context?: string, trace?: string) {
        if (CustomLoggerService.logLevels.includes(level)) {
            const timestamp = new Date().toISOString();
            const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] [${context || this.context || 'Application'}] ${message}`;
            if (trace) {
                console.log(formattedMessage, trace);
            } else {
                console.log(formattedMessage);
            }
        }
    }

    setContext(context: string) {
        this.context = context;
    }
}
