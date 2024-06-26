import { TransformInterceptor } from '../../../src/modules/common/utils/interceptor';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';

describe('TransformInterceptor', () => {
    let interceptor: TransformInterceptor<any>;
    let context: ExecutionContext;
    let callHandler: CallHandler;

    beforeEach(() => {
        interceptor = new TransformInterceptor();
        context = {
            switchToHttp: jest.fn().mockReturnValue({
                getResponse: jest.fn().mockReturnValue({
                    statusCode: 200,
                }),
            }),
        } as unknown as ExecutionContext;

        callHandler = {
            handle: jest.fn().mockReturnValue(of({ data: 'test' })),
        };
    });

    it('should transform response correctly', async () => {
        const result = await interceptor.intercept(context, callHandler).toPromise();

        expect(result).toEqual({
            message: 'Request successful',
            statusCode: 200,
            data: { data: 'test' },
        });
    });
});
