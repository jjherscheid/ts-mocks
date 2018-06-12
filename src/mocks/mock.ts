import { Setup } from './setup';

export type RecursivePartial<T> = Partial<{ [key in keyof T]: RecursivePartial<T[key]> | T[key] }>;

/** Class for mocking objects/interfaces in Typescript */
export class Mock<T> {

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
        const spy = ((jasmine as any).isSpy(obj[key]) ? obj[key] : spyOn(obj, key)) as jasmine.Spy;
        spy.calls.reset();
        spy.and.callFake(stub);
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
            if (typeof object[key] === 'function' && !(jasmine as any).isSpy(object[key])) {
                spyOn(object, key).and.callThrough();
            }
        });
        Object.assign(this._object, object);
        return this;
    }

    /** Setup a property or a method with using lambda style settings */
    public setup<TProp>(value: (obj: T) => TProp): Setup<T, TProp> {
        const propertyName = this.getPropertyName(value);

        return new Setup(this, propertyName);
    }

    private getPropertyName<TProp>(value: (obj: T) => TProp): string {
        return value.toString().match(/return\s[\w\d_]*\.([\w\d$_]*)\;/)[1];
    }
}
