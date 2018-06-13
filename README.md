# Typescript Mocking Framework

Create **Type-Safe** Mock objects for Typescript Classes and Interfaces
with spies automatically created when mocking a method so it is still possible to use verification methods like toHaveBeenCalled().

# Changes

**2.0 => 3.0** Has breaking change in API. Setup is gone and now there is jest support

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

  // The above scenario is also possible with the contructor or extend using the Mock.ANY_FUNC
  mockCookieService = new Mock<CookieService>({ put: Mock.ANY_FUNC});
  // or
  mockCookieService.extend({ put: Mock.ANY_FUNC});

  // Mocking static methods is possible using the Mock.static method
  // class Foo {
  //   static bar(): string {
  //     return 'bar';
  //   }
  // }
  Mock.static(Foo, 'bar', () => 'some expected output');

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
is no intellisense for this. With this framework it is possible to create Mock objects with intellisense and possibility to
override methods during your tests and even by type-safe!!!

```javascript
beforeEach(() => {
  TestBed.configureTestingModule({
    ...
    providers: [{
      provide: CookieService,
      useValue: new Mock<CookieService>({ get: (key) => `customized-${key}`,    // Default setup of method
                                          put: Mock.ANY_FUNC }).Object
    }]
  });
});
```

You don't need to use the TestBed setup if you don't want to. Creating Mocks is not related
to the TestBed. The following is also possible:

```javascript
beforeEach(() => {
  // Create new version every test using the new constructor
  const mockCookieService = new Mock<CookieService>({
    get: (key) => `customized-${key}`,    // Default setup of method
    put: Mock.ANY_FUNC                    // Returns undefined as value
  });

  sut = new MyOwnService(mockCookieService.Object);
});

```

In your test you can define other behavior using the 'extend' method of the Mock<T>.

```javascript

it('using with default setup from beforeEach', () => {
  expect(sut.get('Test')).toEqual(null);
});

it('setup different value in test', () => {
  mockCookieService.extend({ get : (key) => 'TestValue'});

  expect(cookieService.get('Test')).toEqual('TestValue');
  expect(cookieService.get).toHaveBeenCalled();
});

it('setup different value in test in testbed', () => {
  new Mock<CookieService>(TestBed.get(CookieService)).extend({ get : (key) => 'TestValue' });

  expect(cookieService.get('Test')).toEqual('TestValue');
  expect(cookieService.get).toHaveBeenCalled();
});

```

Every method that is mocked using the constructor or 'extend' is automatically spied using jasmine or jest spies (jasmine by default). So it is possible to use 'expect().toHaveBeenCalled' methods etc. Therefor it is not needed any more to use the jasmine.Spy object directly for mocking behavior.
ts-mocks helps you to be type-safe (so use that ;-))

```javascript

it('check if methods has been called', () => {
  const cookiesService = new Mock<CookieService>({ get: (key) => 'TestValue'});
  cookiesSerivce.get();
  expect(cookieService.get).toHaveBeenCalled();
});

```
