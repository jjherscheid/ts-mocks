const UNDEFINED_STRING = 'undefined';
const FUNCTION_STRING = 'function';

/** Class that handles the setup of a property/function */
export class Setup<T, TReturn> {
    constructor(
        private object: T,
        private key: string,
        private originalValues: any[]
    ) { }

    /** Setup the return value for the setup of the property */
    public returns(value: TReturn) {
        // Get the value type for runtime checking
        let valueType = typeof (value);

        // Get the type of the property that is handled by this setup
        let propertyType = typeof (this.object[this.key]);

        // If types do not match throw error. If property type is undefined
        // accept the value (proberbly T is an interface)
        if (propertyType !== valueType && propertyType !== UNDEFINED_STRING) {
            throw Error(`The type of property '${this.key}' (${propertyType}) does not match the type in the setup (${valueType})!`);
        }

        // If the valueType is not a function store the value in an originalValues List 
        if (!this.originalValues[this.key] && typeof (value) !== FUNCTION_STRING) {
            this.originalValues[this.key] = this.object[this.key];
        }

        // Set the new value
        this.object[this.key] = value;
    }

    /** Revert a previous setup back to original value */
    public revertToDefault() {
        // Get the type of the property that is handled by this setup
        let propertyType = typeof (this.object[this.key]);

        // Check if the property exists on the object
        let isOwnProperty = this.object.hasOwnProperty(this.key);


        // If the property is a function the mocked property is set on the
        // mockObject. (The real method is still availabl on the __proto__ object)
        // therefor it is possible to remove the method using 'delete'
        if (propertyType === FUNCTION_STRING && isOwnProperty) {
            // Delete the mocked method
            delete this.object[this.key];
        } else if (propertyType !== FUNCTION_STRING && isOwnProperty) {
            // For not functions revert back using the original value
            this.object[this.key] = this.originalValues[this.key];
        } else {
            // If no setup is defined revert should not do anything
            // But show warning in output
            console.warn(`function/property '${this.key}' has no setup defined`);
        }
    }
}

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

    /** Create a mock setup for the mocked object */
    public setup<TProp>(value: (obj: T) => TProp): Setup<T, TProp> {
        // Get the property name using a regular expression
        let propertyAs = value.toString().match(/return\s[\w\d]*\.([\w\d]*)\;/)[1];

        // Create a Setup and return it
        return new Setup(this._object, propertyAs, this.originalPropertyValues);
    }    
}
