import { Mock } from './mock';
import Spy = jasmine.Spy;

const FUNCTION_STRING = 'function';

export class Setup<T, TReturn> {

    private spy: Spy;

    constructor(
        private mock: Mock<T>,
        private key: string,
    ) {
        mock.Object[key] = <T>{};
        this.spy = spyOn(mock.Object, key as keyof T);
    }

    public get Spy() {
        return this.spy;
    }

    /** Setup the return value for the setup of the property */
    public is(value: TReturn) : Mock<T> {

        this.mock.Object[this.key] = value;
        if(typeof(value) === FUNCTION_STRING) {
            this.spy = spyOn(this.mock.Object, this.key as keyof T).and.callThrough();
        }
        return this.mock;
    }
}
