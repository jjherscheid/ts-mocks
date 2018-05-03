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

    describe('using setup()', () => {
        describe('without is()', () => {
            it('should return undefined for function if not using is', () => {
                const mock = new Mock<Foo>();
                mock.setup(f => f.fighters);
                expect(mock.Object.fighters()).toBeUndefined();
            });
        });

        describe('with is()', () => {
            it('should extend the mock object with the supplied property', () => {
                const mock = new Mock<Foo>()
                    .setup(f => f.bar)
                    .is(':-)');
                expect(mock.Object.bar).toEqual(':-)');
            });

            it('should extend the mock object with the supplied function', () => {
                const mock = new Mock<Foo>()
                    .setup(f => f.fighters)
                    .is(() => false);
                expect(mock.Object.fighters()).toBeFalsy();
            });

            it('should extend the mock object with spies for the supplied function', () => {
                const mock = new Mock<Foo>()
                    .setup(f => f.fighters)
                    .is(() => false);
                mock.Object.fighters();
                expect(mock.Object.fighters).toHaveBeenCalled();
            });

            it('should have no prob setting up an already extended method', () => {
                const mock = new Mock<Foo>({ fighters: () => true })
                    .setup(f => f.fighters)
                    .is(() => false);

                expect(mock.Object.fighters()).toBeFalsy();
                expect(mock.Object.fighters).toHaveBeenCalled();
            });

            it('should have no prob setting up an method that has been setup multiple times', () => {
                const mock = new Mock<Foo>()
                    .setup(f => f.fighters)
                    .is(() => false);

                expect(mock.Object.fighters()).toBeFalsy();

                mock.setup(f => f.fighters)
                    .is(() => true);

                expect(mock.Object.fighters()).toBeTruthy();

                mock.setup(f => f.fighters)
                    .is(() => false);

                expect(mock.Object.fighters()).toBeFalsy();
                expect(mock.Object.fighters).toHaveBeenCalled();
            });

            it('should have no prob setting up an property that has be setup multiple times', () => {
                const mock = new Mock<Foo>()
                    .setup(f => f.bar)
                    .is('first');
                expect(mock.Object.bar).toEqual('first');

                mock.setup(f => f.bar)
                    .is('second');

                expect(mock.Object.bar).toEqual('second');

                mock.setup(f => f.bar)
                    .is('third');
                expect(mock.Object.bar).toEqual('third');
            });

            it('should return undefined if using the Mock.ANY_FUNC', () => {
                const mock = new Mock<Foo>();

                mock.setup(f => f.fighters).is(Mock.ANY_FUNC);

                expect(mock.Object.fighters()).toBeUndefined();
                expect(mock.Object.fighters).toHaveBeenCalled();
            });

            it('should allow setup/is chaining', () => {
                const mock = new Mock<Foo>();

                mock.setup(f => f.fighters).is(() => false)
                    .setup(f => f.bar).is('someValue');

                expect(mock.Object.fighters()).toBeFalsy();
                expect(mock.Object.bar).toEqual('someValue');
            });

            it('should work with nested types', () => {
                const mock = new Mock<Foo>();
                const mockNested = new Mock<Bar>();

                mockNested.setup(b => b.blurg).is('hi');
                mock.setup(f => f.blah).is(mockNested.Object);

                expect(mock.Object.blah.blurg).toEqual('hi');                
            });
        });
    });

    describe('mixing extend and setup', () => {
        it('should still work when using setup first', () => {
            const mock = new Mock<Foo>();

            mock.setup(f => f.fighters).is(() => false);
            mock.setup(f => f.bar).is('someValue');

            expect(mock.Object.fighters()).toBeFalsy();
            expect(mock.Object.bar).toEqual('someValue');

            mock.extend({ fighters: () => true, bar: 'someOtherValue' });

            expect(mock.Object.fighters()).toBeTruthy();
            expect(mock.Object.bar).toEqual('someOtherValue');
        });

        it('should still work when using extend first', () => {
            const mock = new Mock<Foo>();

            mock.extend({ fighters: () => true, bar: 'someOtherValue' });

            expect(mock.Object.fighters()).toBeTruthy();
            expect(mock.Object.bar).toEqual('someOtherValue');

            mock.setup(f => f.fighters).is(() => false);
            mock.setup(f => f.bar).is('someValue');

            expect(mock.Object.fighters()).toBeFalsy();
            expect(mock.Object.bar).toEqual('someValue');
        });
    });

    describe('using spyOf()', () => {

        it('should return undefined if no setup found for method', () => {
            const mock = new Mock<Foo>();
            const spy = mock.spyOf(x => x.fighters);

            expect(spy).toBeUndefined();
        });

        it('should return undefined for properties without setup', () => {
            const mock = new Mock<Foo>();
            const spy = mock.spyOf(x => x.bar);

            expect(spy).toBeUndefined();
        });

        it('should return undefined for properties with setup', () => {
            const mock = new Mock<Foo>({ bar: ';-)'});
            const spy = mock.spyOf(x => x.bar);

            expect(spy).toBeUndefined();
        });

        describe('with setup()', () => {
            it('should return the current spy of that function', () => {
                const mock = new Mock<Foo>();
                mock.setup(x => x.fighters).is(() => true);
                const spy = mock.spyOf(x => x.fighters);

                expect(mock.Object.fighters()).toBeTruthy();
                expect(spy).toHaveBeenCalled();
            });

            it('should return the current spy of that function after setup multiple times', () => {
                const mock = new Mock<Foo>();
                mock.setup(x => x.fighters).is(() => true);
                mock.setup(x => x.fighters).is(() => false);
                const spy = mock.spyOf(x => x.fighters);

                expect(mock.Object.fighters()).toBeFalsy();
                expect(spy).toHaveBeenCalled();
            });
        });

        describe('with extend()', () => {
            it('should return the current spy of that function', () => {
                const mock = new Mock<Foo>();
                mock.extend({ fighters: () => true});
                const spy = mock.spyOf(x => x.fighters);

                expect(mock.Object.fighters()).toBeTruthy();
                expect(spy).toHaveBeenCalled();
            });

            it('should return the current spy of that function after extend multiple times', () => {
                const mock = new Mock<Foo>();
                mock.extend({ fighters: () => true});
                mock.extend({ fighters: () => false});
                const spy = mock.spyOf(x => x.fighters);

                expect(mock.Object.fighters()).toBeFalsy();
                expect(spy).toHaveBeenCalled();
            });
        });

        describe('with constructor()', () => {
            it('should return the current spy of that function', () => {
                const mock = new Mock<Foo>({ fighters: () => true});
                const spy = mock.spyOf(x => x.fighters);

                expect(mock.Object.fighters()).toBeTruthy();
                expect(spy).toHaveBeenCalled();
            });
        });

        describe('when mixing contructor/setup/extend', () => {
            it('should return the current spy of that function', () => {
                const mock = new Mock<Foo>({ fighters: () => true});
                mock.setup(x => x.fighters).is(() => false);
                mock.extend({ fighters: () => true});

                const spy = mock.spyOf(x => x.fighters);

                expect(mock.Object.fighters()).toBeTruthy();
                expect(spy).toHaveBeenCalled();
            });
        });
    });

    it('should allow you to get the spy off of a setup function', () => {
        const mock = new Mock<Foo>();
        const spy = mock.setup(x => x.fighters).Spy;

        mock.Object.fighters();
        expect(spy).toHaveBeenCalled();
    });

    // testing this scenario:
    // Property 'bah' is private in type 'Foo' but not in type 'Partial<{ bah: string; bar: string; fighters: () => boolean; fightersWithParams: (par: string) =>...'.
    it('should allow type inference with private members', () => {
        const foo = new Foo();
        const mock = new Mock(foo);

        mock.setup(m => m.fighters).is(() => false);
    });
});
