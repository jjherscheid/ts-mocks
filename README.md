# Typescript Mocking Framework (using Jasmine)

Create **Type-Safe** Mock objects for Typescript Classes and Interfaces
Jasmine Spy is automatically created when mocking a method so it is still possible to use verification methods like toHaveBeenCalled().

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

In your test you can define other behavior using the 'extend' method of the Mock<T> or using the 'setup' and 'is' methods.

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

it('setup other value in test', () => {
  mockCookieService.setup(cs => cs.get).is((key) => 'TestValue');

  let r = sut.getValue('Test');
  expect(r).toEqual('TestValue');
  expect(cookieService.get).toHaveBeenCalled();

});

```

Every method that is mocked using 'extend' or 'setup' is automatically spied using jasmine.Spy. So it is possible to use 'expect().toHaveBeenCalled' methods etc. Therefor it is not needed any more to use the jasmine.Spy object directly for mocking behavior.
ts-mocks helps you to be type-safe (so use that ;-))

```javascript

it('check if methods has been called', () => {
  mockCookieService.extend({ get: (key) => 'TestValue'});
  var cookiesService = mockCookieService.Object;
  
  sut.getValue('Test');
  
  expect(cookieService.get).toHaveBeenCalled();
});

```

If for some reason you still want the original jasmine.Spy object (just Don't ;-)).
You can use the spyOf() method of the mock. Be aware that you type-safety is gone.

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

## Using TestBed with Ts-mocks

It you want to use TestBed in combination with ts-mock you should be aware to use the correct provider.

In most example you will se the use of _useValue_ as provider type
```javascript

  let mockService: Mock<SubService>;
  let systemUnderTest: MainService;

  beforeEach(() => {
    mockService = new Mock<SubService>({ getSomeValue: () => 'fake value' });

    TestBed.configureTestingModule({
      providers: [
        MainService,
        { provide: SubService, useValue: mockService.Object}  // <-- useValue is used
      ]
    });

    systemUnderTest = TestBed.get(MainService);
  });
  
  it('should return value from mocked subService', () => {
    // No extra mocking should return initial value
    expect(systemUnderTest.getSubValue()).toBe('fake value');
  });
```

This will work if you don't want to change the behavior of the mock during your test.
If you still want to change the behavoir like example below this will not work. This is because useValue creates a copy of the object injected, so this is not the same object as the mockService member.

```javascript
  it('should return another value from mocked subService', () => {
    mockService.extend({ getSomeValue: () => 'fake another value'});

    expect(systemUnderTest.getSubValue()).toBe('fake another value'); // <-- This will fail
  });
```

### Solution for TestBed

The solution for this is _not_ to use _useValue_ but use _useFactory_ which is a method that is called by the DI container every time the service needs to be injected. useFactory is used like so:

```javascript
let mockService: Mock<SubService>;
  let systemUnderTest: MainService;

  beforeEach(() => {
    mockService = new Mock<SubService>({ getSomeValue: () => 'fake value' });

    TestBed.configureTestingModule({
      providers: [
        MainService,
        { provide: SubService, useFactory: () => mockService.Object}   // <-- useFactory
      ]
    });

    systemUnderTest = TestBed.get(MainService);
  });

  it('should return value from mocked subService', () => {
    // No extra mocking should return initial value
    expect(systemUnderTest.getSubValue()).toBe('fake value');
  });
```

When you now want to change the behavior during your test this is possible:

```javascript
  it('should return another value from mocked subService', () => {
    mockService.extend({ getSomeValue: () => 'fake another value'});

    expect(systemUnderTest.getSubValue()).toBe('fake another value');  // <-- Will SUCCEED
  });
```

### A note on setup() and spyOf() methods

Some test environments (for example, [Wallaby.js](https://wallabyjs.com/)) might be incompatible with `ts-mocks` library because these methods use dynamic property name inferring under the hood. In such cases you can try set the property name manually:

```
  mockCookieService.setup(cs => cs.get, 'get')

  // also possible
  mockCookieService.spyOf(cs => cs.get, 'get')
```

Make sure that the property that your lambda `cs => cs.get` returns and the property name `'get'` in the second argument are the same, otherwise the type safety might be broken.

### A note on using other frameworks then Jasmin
If you are using other framework like Jest instead of Jasmine. Have a look at https://github.com/ike18t/ts-mockery.
