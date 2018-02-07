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

    private _object: T = <T>{};
    private _spies: Map<string, () => jasmine.Spy> = new Map<string, () => jasmine.Spy>();    

    constructor(object: Partial<{[key in keyof T]: T[key]}> | T = <T>{}) {
        this._object = object as T;
        this.extend(object);
    }

    /** Return the mocked object */
    public get Object(): T {
        return <T>this._object;
    }

    /** Extend the current mock object with implementation */
    public extend(object: Partial<{[key in keyof T]: T[key]}>): this {
        Object.keys(object).forEach((key) => {
            if (typeof object[key] === 'function') {
                try {
                    let spy = spyOn(object, key as keyof T).and.callThrough();
                    this._spies.set(key, () => spy);
                } catch (e) {
                    // noop: the function is already spied on
                }
            }
        });
        Object.assign(this._object, object);
        return this;
    }

    /** Setup a property or a method with using lambda style settings */
    public setup<TProp>(value: (obj: T) => TProp): Setup<T, TProp> {
        const propertyName = this.getPropertyName(value);

        let setup = new Setup(this, propertyName);
        this._spies.set(propertyName, () => setup.Spy);
        return setup;
    }

    private getPropertyName<TProp>(value: (obj: T) => TProp): string {
        return value.toString().match(/return\s[\w\d_]*\.([\w\d$_]*)\;/)[1];
    }

    /** Get the spy of method or property that has be
     *  set with extend of setup/is
     *  REMARK: 
     */
    public spyOf<TProp>(value: (obj: T) => TProp): jasmine.Spy {
        const propertyName = this.getPropertyName(value);
        if (this._spies.has(propertyName)) {
            return this._spies.get(propertyName)();
        }
        return undefined;
    }

}
