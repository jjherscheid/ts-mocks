import Spy = jasmine.Spy;

const FUNCTION_STRING = 'function';

export class Setup<T, TReturn> {

    private spy: Spy;

    constructor(
        private object: T,
        private key: string
    ) {
        this.object[key] = <T>{};
        this.spy = spyOn(this.object, key as keyof T);
    }

    public get Spy() {
        return this.spy;
    }

    /** Setup the return value for the setup of the property */
    public is(value: TReturn) : Setup<T, TReturn> {

        this.object[this.key] = value;
        if(typeof(value) === FUNCTION_STRING) {
            this.spy = spyOn(this.object, this.key as keyof T).and.callThrough();
        }
        return this;
    }    
}
