# Typescript Mocking Framework

Create Mock objects for Typescript Classes and Interfaces
Jasmine Spy is automatically created during setup method

**Example**:

```javascript

  // Mock for the CookieService from angular2-cookie
  mockCookieService = new Mock<CookieService>();
  mockCookieService.setup(ls => ls.get).is((key) => `customized ${key}`);
  mockCookieService.setup(ls => ls.put);
```

## Why?

When creating Unit Tests with Typescript / Angular most of the examples on the internet use a Mock class that must be
created. A Mock class looks like this:

```javascript

// Mocks the CookieService from angular2-cookie
class MockCookieService {
  public get(key: string): string { return null; }
  public put(key: string, value: string) { }
}

```

The Mock class is used directly or injected by the TestBase.configureTestingModule method.

```javascript

let cookiesService: CookieService;

// Add the providers
beforeEach(() => {
  TestBed.configureTestingModule({
    ...,
    providers: [{ provide: CookieService, useClass: MockCookieService }]
    });
});

// Inject values
beforeEach(inject([ ..., CookieService], (... , _cookieService: CookieService) => {
  ...
  cookieService = cookieSrv;
}));
```

This works 'Okay' but there is no real intellisense for you when you are mocking your objects.
This Mock class must have the same methods as the class to Mock otherwise your test will not work. First time
creation is not so hard, but when you original class changes you have to change all the Mock classes aswell, but there
is intellisense for this. With this framework it is possible to create Mock objects with intellisense and possibility to
override methods during your tests.

```javascript

// Create a variable for the Mock<T> class
let mockCookiesService: Mock<CookieService>;
let cookieService: CookieService;

// NOTE: Change the useClass to useValue and use the

beforeEach(() => {
  // Create new version every test
  mockCookieService = new Mock<CookieService>();

  // Setup defaults with override
  mockCookieService.setup(ls => ls.get).is((key) => `customized-${key}`);

  // Setup with default null return value
  mockCookieService.setup(ls => ls.put);

  // Set the service intannce
  cookieService = mockCookieService.Object;

  TestBed.configureTestingModule({
    ...
    providers: [{ provide: CookieService, useValue: cookieService }]
  });
});

```

You don't need to use the TestBed setup if you don't want to. Creating Mocks is not related
to the TestBed. The following is also possible:

```javascript

let sut: MyOwnService;

beforeEach(() => {
  // Create new version every test
  mockCookieService = new Mock<CookieService>();

  // Setup defaults with override
  mockCookieService.setup(ls => ls.get).is((key) => `customized-${key}`);

  // Setup with default null return value
  mockCookieService.setup(ls => ls.put);

  // Set the service intannce
  cookieService = mockCookieService.Object;

  sut = new MyOwnService(cookieService);
});

```

Basically there are two properties and methods on typscript object that you can Mock like so:

```javascript

  // Property mocking, where someValue must be of the same type as the property
  mockService.setup(ms => ms.someProperty).is(someValue);

  // Method mocking, where the is() defines the new body of the method
  mockService.setup(ms => ms.someMethod).is((arguments) => {
    // mocked implementation
  });

```

In your test you can define other behavior using the 'setup' method of the Mock<T>

```javascript

it('using with default setup from beforeEach', () => {
  let r = sut.getValue('Test');
  expect(r).toEqual(null);
});

it('setup different value in test', () => {
  mockCookieService.setup(ls => ls.get).is((key) => 'TestValue');

  let r = sut.getValue('Test');
  expect(r).toEqual('TestValue');
  expect(cookieService.get).toHaveBeenCalled();

});

```

If you need to change the spy during your unit test you can use the Spy object returned
by the setup() / is() methods. But most of the unit test do not need the spy directly.

```javascript

it('override spy during test', () => {
    let getMethodSetup = mockCookieService.setup(ls => ls.get).is(key => 'TestValue');
    let getMethodSpy = getMethodSetup.Spy;

    let r = sut.getValue('Test');
    expect(r).toEqual('TestValue');
    expect(cookieService.get).toHaveBeenCalled();

    getMethodSpy.and.returnValue('TestValue2');
});

```

You can now contruct an object providing a partial implementation of the generic type
and then extend the mock afterwards.

```javascript

    const mockCookieService = new Mock<CookieService>({ get: (key) => `customized ${key}`, put: () => null });
    mockCookieService.extend({ put: () => 'not null' });

```
