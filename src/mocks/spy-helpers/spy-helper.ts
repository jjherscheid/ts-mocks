export interface SpyHelper {
    spyAndCallThrough: <T, K extends keyof T>(object: T, key: K) => void;
    spyAndCallFake: <T, K extends keyof T>(object: T, key: K, stub: T[K] & Function) => void;
}
