# Typescript Mocking Framework

Create Mock objects for Typescript Classes and Interfaces

**Example**:
```javascript

  // Mock for the CookieService from angular2-cookie
  mockCookieService = new Mock<CookieService>();
  mockCookieService.setup(ls => ls.get).returns(key => null);
  mockCookieService.setup(ls => ls.put).returns((key, value) => {}); 
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
  mockCookieService.setup(ls => ls.get).returns(key => null);
  mockCookieService.setup(ls => ls.put).returns((key, value) => {}); 

  addProviders([
    ...,
    { provide: CookieService, useValue: mockCookieService.Object }
  ]);
});

```

In your test you can define other behavior using the 'setup' method of the Mock<T>
```

it('using with default setup from beforeEach', () => {
  let r = sut.getValue('Test');
  expect(r).toEqual(null);
});

it('setup different value in test', () => {
  mockCookieService.setup(ls => ls.get).returns(key => key);
  
  let r = sut.getValue('Test');
  expect(r).toEqual('Test');
});
```
