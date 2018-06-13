import { SpyHelper } from './spy-helper';

export class JasmineHelper implements SpyHelper {
    spyAndCallFake<T, K extends keyof T>(object: T, key: K, stub: T[K] & Function) {
        const value = (object as any)[key];
        const spy = ((jasmine as any).isSpy(value) ? value : spyOn(object, key)) as jasmine.Spy;
        spy.calls.reset();
        spy.and.callFake(stub);
    }

    spyAndCallThrough<T, K extends keyof T>(object: T, key: K) {
        const value = object[key];
        if (typeof value === 'function' && !(jasmine as any).isSpy(value)) {
            spyOn(object, key).and.callThrough();
        }
    }
}
