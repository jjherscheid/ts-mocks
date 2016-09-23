# Typescript Mocking Framework

Create Mock objects for Typescript Classes and Interfaces  
Jasmine Spy is automatically created during setup method

**Example**:

```javascript

  // Mock for the CookieService from angular2-cookie
  mockCookieService = new Mock<CookieService>();
  mockCookieService.setup(ls => ls.get);
  mockCookieService.setup(ls => ls.put); 
```

## Why?

When creating Unit Tests with Typescript / Angular most of the examples use a Mock object created your self like:

```javascript

// Mocks the CookieService from angular2-cookie
class MockCookieService {
  public get(key: string): string { return null; }
  public put(key: string, value: string) { }
}

```

The Mock class in then used directly or injected by the addProviders method

```javascript

let cookiesService: CookieService;

// Add the providers
beforeEach(() => {
  addProviders([
    ...,
    { provide: CookieService, useClass: MockCookieService }
  ]);
});

// Inject values
beforeEach(inject([ ..., CookieService], (... , _cookieService: CookieService) => {
  ...
  cookieService = cookieSrv;
}));
```

This works 'Okay' but there is no real intellisense for you when you are mocking your objects.  
With this framework it is possible to create Mock objects with intellisense and possibility to
override methods during your tests.

```javascript

// Create a variable for the Mock<T> class
let mockCookiesService: Mock<CookieService>;

// NOTE: Change the useClass to useValue and use the 

beforeEach(() => {
  // Create new version every test
  mockCookieService = new Mock<CookieService>();
  
  // Setup defaults
  mockCookieService.setup(ls => ls.get);
  mockCookieService.setup(ls => ls.put); 

  addProviders([
    ...,
    { provide: CookieService, useValue: mockCookieService.Object }
  ]);
});

```

In your test you can define other behavior using the 'setup' method of the Mock<T>

```javascript

it('using with default setup from beforeEach', () => {
  let r = sut.getValue('Test');
  expect(r).toEqual(null);
});

it('setup different value in test', () => {
  mockCookieService.setup(ls => ls.get).is(key => 'TestValue');
  
  let r = sut.getValue('Test');
  expect(r).toEqual('TestValue');
  expect(cookieService.get).toHaveBeenCalled();

});

```

If you need to change the spy during your unit test you can use the Spy object returned
by the setup() / is() methods

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
