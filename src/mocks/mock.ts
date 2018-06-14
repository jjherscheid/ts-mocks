import { JasmineHelper } from './spy-helpers/jasmine-helper';
import { JestHelper } from './spy-helpers/jest-helper';
import { SpyHelper } from './spy-helpers/spy-helper';
import { SpyHelperFactory } from './spy-helper-factory';

export type RecursivePartial<T> = Partial<{ [key in keyof T]: RecursivePartial<T[key]> | T[key] }>;

/** Class for mocking objects/interfaces in Typescript */
export class Mock<T> {
    private static _spyHelper: SpyHelper;

    private static get spyHelper(): SpyHelper {
        if(!this._spyHelper) {
          this._spyHelper = SpyHelperFactory.get();
        }
        return this._spyHelper;
    }

    /**
     * Can be used to define empty methods when using extend
     * mock.extend({ someMethod: Mock.ANY_FUNC });
    */
    public static ANY_FUNC = () => undefined;

    /** Create mock from a Type */
    public static of<T>(type: { new(): T }): Mock<T> {
        return new Mock<T>(new type());
    }

    public static static<T, K extends keyof T>(obj: T, key: K, stub: T[K] & Function): void {
        this.spyHelper.spyAndCallFake(obj, key, stub);
    }

    private _object: T = <T>{};

    constructor(object: RecursivePartial<T> | T = <T>{}) {
        this._object = object as T;
        this.extend(object);
    }

    /** Return the mocked object */
    public get Object(): T {
        return <T>this._object;
    }

    /** Extend the current mock object with implementation */
    public extend(object: RecursivePartial<T>): this {
        Object.keys(object).forEach((key: keyof T) => {
            Mock.spyHelper.spyAndCallThrough(object, key);
        });
        Object.assign(this._object, object);
        return this;
    }
}
