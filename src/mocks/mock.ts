import { Setup } from './setup';

/** Class for mocking objects/interfaces in Typescript */
export class Mock<T> {

    private _object: T = <T>{};

    /** Create mock from a Type */
    public static of<T>(type: { new (): T }): Mock<T> {
        return new Mock<T>(new type());
    }

    constructor(object: Partial<{ [ key in keyof T ]: T[key] }> = {}) {
      this.extend(object);
    }

    /** Return the mocked object */
    public get Object(): T {
        return <T>this._object;
    }

    public extend(object: Partial<{ [ key in keyof T ]: T[key] }> = {}): this {
      Object.keys(object).forEach((key) => {
        if (typeof object[key] === 'function') {
          spyOn(object, key as keyof T).and.callThrough();
        }
      });
      Object.assign(this._object, object);
      return this;
    }

    public setup<TProp>(value: (obj: T) => TProp): Setup<T, TProp> {
        let propertyName = value.toString().match(/return\s[\w\d_]*\.([\w\d$_]*)\;/)[1];

        return new Setup(this._object, propertyName);
    }
}
