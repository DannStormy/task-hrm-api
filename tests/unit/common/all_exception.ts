import { AllExceptionsFilter } from '../../../src/modules/common/utils/filter';
import { HttpException, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

describe('AllExceptionsFilter', () => {
    let filter: AllExceptionsFilter;
    let mockArgumentsHost: ArgumentsHost;
    let mockResponse: Partial<Response>;
    let mockRequest: Partial<Request>;

    beforeEach(() => {
        filter = new AllExceptionsFilter();

        mockRequest = {
            url: '/test-url',
        };

        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        mockArgumentsHost = {
            switchToHttp: jest.fn().mockReturnValue({
                getRequest: jest.fn().mockReturnValue(mockRequest),
                getResponse: jest.fn().mockReturnValue(mockResponse),
            }),
        } as unknown as ArgumentsHost;
    });

    it('should handle HttpException correctly', () => {
        const exception = new HttpException('Test Error', HttpStatus.BAD_REQUEST);

        filter.catch(exception, mockArgumentsHost);

        expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
        expect(mockResponse.json).toHaveBeenCalledWith({
            statusCode: HttpStatus.BAD_REQUEST,
            timestamp: expect.any(String),
            path: '/test-url',
            message: 'Test Error',
            error: 'Error',
        });
    });

    it('should handle unknown exception correctly', () => {
        const exception = new Error('Unknown Error');

        filter.catch(exception, mockArgumentsHost);

        expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(mockResponse.json).toHaveBeenCalledWith({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            timestamp: expect.any(String),
            path: '/test-url',
            message: 'Internal server error',
            error: 'Error',
        });
    });
});
