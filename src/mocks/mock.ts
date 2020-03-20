import { Setup } from './setup';

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
        const spy = ((jasmine as any).isSpy(obj[key]) ? obj[key] : spyOn(obj as any, key)) as jasmine.Spy;
        spy.calls.reset();
        spy.and.callFake(stub as any);
    }

    private _object: T = <T>{};
    private _spies: Map<string, () => jasmine.Spy> = new Map<string, () => jasmine.Spy>();

    constructor(object: Partial<{ [key in Extract<keyof T, string>]: T[key] }> | T = <T>{}) {
        this._object = object as T;
        this.extend(object);
    }

    /** Return the mocked object */
    public get Object(): T {
        return <T>this._object;
    }

    /** Extend the current mock object with implementation */
    public extend(object: Partial<{ [key in Extract<keyof T, string>]: T[key] }>): this {
        Object.keys(object).forEach((key: Extract<keyof T, string>) => {
            if (typeof object[key] === 'function' && !(jasmine as any).isSpy(object[key])) {
                const spy = spyOn(object as any, key).and.callThrough();
                this._spies.set(key, () => spy);
            }
        });
        Object.assign(this._object, object);
        return this;
    }

    /** 
     * Setup a property or a method with using lambda style settings.
     * @param propertyName can be used as a fallback for environments where 
     * dynamic inferring of `propertyName` is not possible. 
     * For example, can be helpful in Wallaby.js test runner.
     */
    public setup<TProp>(value: (obj: T) => TProp, propertyName?: string): Setup<T, TProp> {
        if (!propertyName) {
            propertyName = this.getPropertyName(value);
        }

        let setup = new Setup(this, propertyName);
        this._spies.set(propertyName, () => setup.Spy);
        return setup;
    }

    private getPropertyName<TProp>(value: (obj: T) => TProp): string {
        return value.toString().match(/(return|=>)\s[\w\d_]*\.([\w\d$_]*)\;?/)[2];
    }

    /** 
     * Get the spy of method or property that has be set with extend of setup/is.
     * @param propertyName can be used as a fallback for environments where 
     * dynamic inferring of `propertyName` is not possible. 
     * For example, can be helpful in Wallaby.js test runner.
     */
    public spyOf<TProp>(value: (obj: T) => TProp, propertyName?: string): jasmine.Spy {
        if (!propertyName) {
            propertyName = this.getPropertyName(value);
        }

        if (this._spies.has(propertyName)) {
            return this._spies.get(propertyName)();
        }
        return undefined;
    }

    /**
     * Get the jasmineCalls information of a specify method 
     * @summary due to @types/jasmine update the jasmine.Calls is not working anymore
     * therefor the callsOf method now returns any instead of jasmineCalls.  
     * In runtime this method returns a jasmine.Calls or jasmine.Calls<Fn>
     */
    public callsOf<TProp>(value: (obj: T) => TProp, propertyName?: string): any {
        let spy = this.spyOf(value);
        return spy ? spy.calls : undefined;
    }

    /**
     * Reset the calls count of a specific method
     */
    public resetCalls<TProp>(value: (obj: T) => TProp, propertyName?: string): void {
        let calls = this.callsOf(value)
        if (calls) {
            calls.reset();
        }
    }
}
