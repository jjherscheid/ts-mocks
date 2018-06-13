import { Mock } from './mock';
import { BADQUERY } from 'dns';

interface Bar {
  blah: string;
  blurg: string;
}
class Foo {
    private bah = 'hi';
    bar = ':-P';
    fighters = () => true;
    fightersWithParams = (par: string) => par;
    fightersVoid = (i: number): void => {
        // do something with i
    };
    static bar(): string {
        throw new Error();
    }
    blah: Bar
}

Mock.configure(process.env.FRAMEWORK || 'jasmine' as any);

describe('Mock', () => {
    describe('using constructor', () => {
        it('should construct the mock object with the supplied property', () => {
            const mock = new Mock<Foo>({ bar: ':-)' });
            expect(mock.Object.bar).toEqual(':-)');
        });

        it('should construct the mock object with the supplied function', () => {
            const mock = new Mock<Foo>({ fighters: () => false });
            expect(mock.Object.fighters()).toBeFalsy();
        });

        it('should construct the mock object with spies for the supplied function', () => {
            const mock = new Mock<Foo>({ fighters: () => false });

            mock.Object.fighters();
            expect(mock.Object.fighters).toHaveBeenCalled();
        });

        it('should not error if trying to spy on a function that already has a spy', () => {
            const mock = new Mock<Foo>({ fighters: () => false });

            expect(() => new Mock<Foo>(mock.Object)).not.toThrowError();
        });

        it('should return undefined if using the Mock.ANY_FUNC', () => {
            const mock = new Mock<Foo>({fighters : Mock.ANY_FUNC});

            expect(mock.Object.fighters()).toBeUndefined();
            expect(mock.Object.fighters).toHaveBeenCalled();
        });

        it('should work with nested types', () => {
            const mock = new Mock<Foo>({blah : {blurg : 'hi'}});

            expect(mock.Object.blah.blurg).toEqual('hi');
        });
    });

    describe('static', () => {
        it('should not call the underlying implememtation', () => {
            Mock.static(Foo, 'bar', Mock.ANY_FUNC);
            expect(() => { Foo.bar(); }).not.toThrow();
        });

        it('should call fake', () => {
            Mock.static(Foo, 'bar', () => 'hi');
            expect(Foo.bar()).toEqual('hi');
        });

        it('should be a spy', () => {
            Mock.static(Foo, 'bar', Mock.ANY_FUNC);
            Foo.bar();
            expect(Foo.bar).toHaveBeenCalled();
        });

        if ((window as any).__karma__) {
            it('should reset the call count', () => {
                Mock.static(Foo, 'bar', Mock.ANY_FUNC);
                Foo.bar();
                Mock.static(Foo, 'bar', Mock.ANY_FUNC);
                expect(Foo.bar).not.toHaveBeenCalled();
            });
        }

        it('should overwrite spy fake', () => {
            Mock.static(Foo, 'bar', Mock.ANY_FUNC);
            Mock.static(Foo, 'bar', () => 'hi');
            expect(Foo.bar()).toEqual('hi');
        });
    });

    describe('using extend()', () => {
        it('should extend the mock object with the supplied property', () => {
            const mock = new Mock<Foo>().extend({ bar: ':-)' });
            expect(mock.Object.bar).toEqual(':-)');
        });

        it('should extend the mock object with the supplied function', () => {
            const mock = new Mock<Foo>().extend({ fighters: () => false });
            expect(mock.Object.fighters()).toBeFalsy();
        });

        it('should extend the mock object with spies for the supplied function', () => {
            const mock = new Mock<Foo>().extend({ fighters: () => false });

            mock.Object.fighters();
            expect(mock.Object.fighters).toHaveBeenCalled();
        });

        it('should have no prob extending an already mocked method', () => {
            const mock = new Mock<Foo>({ fighters: () => true }).extend({ fighters: () => false });

            expect(mock.Object.fighters()).toBeFalsy();
            expect(mock.Object.fighters).toHaveBeenCalled();
        });

        it('should have no prob extending an already mocked method multiple times', () => {
            const mock = new Mock<Foo>().extend({ fighters: () => false });

            expect(mock.Object.fighters()).toBeFalsy();

            mock.extend({ fighters: () => true });

            expect(mock.Object.fighters()).toBeTruthy();

            mock.extend({ fighters: () => false });

            expect(mock.Object.fighters()).toBeFalsy();
            expect(mock.Object.fighters).toHaveBeenCalled();
        });

        it('should have no prob extending an already mocked property multiple times', () => {
            const mock = new Mock<Foo>().extend({ bar: 'first' });

            expect(mock.Object.bar).toEqual('first');

            mock.extend({ bar: 'second' });

            expect(mock.Object.bar).toEqual('second');

            mock.extend({ bar: 'third' });

            expect(mock.Object.bar).toEqual('third');
        });

        it('should return undefined if using the Mock.ANY_FUNC', () => {
            const mock = new Mock<Foo>();

            mock.extend({fighters : Mock.ANY_FUNC});

            expect(mock.Object.fighters()).toBeUndefined();
            expect(mock.Object.fighters).toHaveBeenCalled();
        });

        it('should be able to use Mock.ANY_FUNC on different types of method interfaces', () => {
            const bah = {} as Foo;
            const mock = new Mock<Foo>(bah);

            mock.extend({
                fighters: Mock.ANY_FUNC,
                fightersWithParams: Mock.ANY_FUNC,
                fightersVoid: Mock.ANY_FUNC
            });

            expect(bah.fighters()).toBeUndefined();
            expect(bah.fighters).toHaveBeenCalled();
            expect(bah.fightersWithParams('test')).toBeUndefined();
            expect(bah.fightersVoid(1)).toBeUndefined();
        });

        it('should work with nested types', () => {
            const mock = new Mock<Foo>().extend({blah : {blurg : 'hi'}});

            expect(mock.Object.blah.blurg).toEqual('hi');
        });
    });
});
