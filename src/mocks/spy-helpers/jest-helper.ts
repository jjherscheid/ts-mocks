import { SpyHelper } from './spy-helper';

export class JestHelper implements SpyHelper {
    spyAndCallFake<T, K extends keyof T>(object: T, key: K, stub: T[K] & Function) {
        jest.spyOn(object, key).mockImplementation(stub as any);
    }

    spyAndCallThrough<T, K extends keyof T>(object: T, key: K) {
        if (typeof object[key] === 'function') {
            jest.spyOn(object, key);
        }
    }
}
