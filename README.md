# Typescript Mocking Framework

Create Mock objects for Typescript Classes and Interfaces
Jasmine Spy is automatically created during setup method

# Changes

**1.0 => 2.0** Has breaking change in API. But that's only if you used the .Spy properties of the setup() and is() methods

**Example**:

Initializing and setting up a new Mock object can be done in several ways:

```javascript

  // 1. Use the new constructor with Partial<T> which is great
  //    because you can use an object with all the setup you want
  mockCookieService = new Mock<CookieService>({ get: (key) => `customized ${key}`});
  
  // 2. Use the new 'extend()' method with Partial<T>.
  //    With the extend method it is possible to override settings during tests
  mockCookieService = new Mock<CookieService>();
  mockCookieService.extend({ get: (key) => `customized ${key}`})
 
  // 3. Use the already existing 'setup()' method.
  //    The setup method is great for properties or methods that should be availble
  //    during you test, but do not need an implementation for the test to run.
  mockCookieService = new Mock<CookieService>();
  mockCookieService.setup(ls => ls.put);

  // The above scenario is also possible with the contructor or extend using the Mock.ANY_FUNC
  mockCookieService = new Mock<CookieService>({ put: Mock.ANY_FUNC});
  // or
  mockCookieService.extend({ put: Mock.ANY_FUNC}); 

  // when using the setup method it is still possible to define the implementation
  // with both 'is()' method as the extend method
  mockCookieService.setup(cs => cs.get).is((key) => `customized ${key}`);
  mockCookieService.extend({ get: (key) => `customized ${key}`});

  // You can also chain setup/is combinations like
  mockCookieService
      .setup(cs => cs.get).is((key) => `customized ${key}`)
      .setup(cs => cs.put).is((key) => { /* do something */ });
  
 
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
  // Create new version every test using the new constructor
  mockCookieService = new Mock<CookieService>({
    get: (key) => `customized-${key}`,    // Default setup of method
    put: Mock.ANY_FUNC                    // Returns undefined as value
  });
  
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
  // Create new version every test using the new constructor
  mockCookieService = new Mock<CookieService>({
    get: (key) => `customized-${key}`,    // Default setup of method
    put: Mock.ANY_FUNC                    // Returns undefined as value
  });

  // Set the service intannce
  cookieService = mockCookieService.Object;

  sut = new MyOwnService(cookieService);
});

```

In your test you can define other behavior using the 'extend' method of the Mock<T>

```javascript

it('using with default setup from beforeEach', () => {
  let r = sut.getValue('Test');
  expect(r).toEqual(null);
});

it('setup different value in test', () => {
  mockCookieService.extend({ get : (key) => 'TestValue'});

  let r = sut.getValue('Test');
  expect(r).toEqual('TestValue');
  expect(cookieService.get).toHaveBeenCalled();

});

```

If you need to change the spy during your unit test you can use the Spy object returned by the spyOf() method. But most of the unit test do not need the spy directly.

```javascript

it('override spy during test', () => {
    let getMethodSetup = mockCookieService.setup(cs => cs.get).is(key => 'TestValue');
    let getMethodSpy = mockCookieService.spyOf(cs => cs.get);

    let r = sut.getValue('Test');
    expect(r).toEqual('TestValue');
    expect(cookieService.get).toHaveBeenCalled();

    getMethodSpy.and.returnValue('TestValue2');
});

```
