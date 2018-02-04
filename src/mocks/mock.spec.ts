import { Mock } from './mock';

class Foo {
  bar = ':-P'
  fighters = () => true
}

describe('Mock', () => {
  describe('constructor', () => {
    it('should construct the mock object with the supplied property', () => {
      const mock = new Mock<Foo>({ bar: ':-)' })
      expect(mock.Object.bar).toEqual(':-)');
    });

    it('should construct the mock object with the supplied function', () => {
      const mock = new Mock<Foo>({ fighters: () => false })
      expect(mock.Object.fighters()).toBeFalsy();
    });

    it('should construct the mock object with spies for the supplied function', () => {
      const mock = new Mock<Foo>({ fighters: () => false })

      mock.Object.fighters();
      expect(mock.Object.fighters).toHaveBeenCalled();
    });
  });

  describe('extend', () => {
    it('should extend the mock object with the supplied property', () => {
      const mock = new Mock<Foo>().extend({ bar: ':-)' })
      expect(mock.Object.bar).toEqual(':-)');
    });

    it('should extend the mock object with the supplied function', () => {
      const mock = new Mock<Foo>().extend({ fighters: () => false })
      expect(mock.Object.fighters()).toBeFalsy();
    });

    it('should extend the mock object with spies for the supplied function', () => {
      const mock = new Mock<Foo>().extend({ fighters: () => false })

      mock.Object.fighters();
      expect(mock.Object.fighters).toHaveBeenCalled();
    });

    it('should have no prob extending an already mocked method', () => {
      const mock = new Mock<Foo>({ fighters: () => true }).extend({ fighters: () => false })

      expect(mock.Object.fighters()).toBeFalsy();
      expect(mock.Object.fighters).toHaveBeenCalled();
    });
  });

  it('should not break the pre-existing API', () => {
    const mock = new Mock<Foo>();
    mock.setup(f => f.fighters).is(() => false);
    expect(mock.Object.fighters()).toBeFalsy();
  });
});
