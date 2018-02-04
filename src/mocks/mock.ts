import { Setup } from './setup';

/** Class for mocking objects/interfaces in Typescript */
export class Mock<T> {

    private _object: T = <T>{};
    private originalPropertyValues: any[] = [];

    /** Create mock from a Type */
    public static of<T>(type: { new (): T }): Mock<T> {
        return new Mock<T>(new type());
    }

    constructor(obj: T = <T>{}) {
        this._object = obj;
    }

    /** Return the mocked object */
    public get Object(): T {
        return <T>this._object;
    }

    public setup<TProp>(value: (obj: T) => TProp): Setup<T, TProp> {
        let propertyName = value.toString().match(/return\s[\w\d_]*\.([\w\d$_]*)\;/)[1];

        return new Setup(this._object, propertyName);
    }
}
