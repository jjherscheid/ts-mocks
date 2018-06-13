import { JasmineHelper } from './spy-helpers/jasmine-helper';
import { JestHelper } from './spy-helpers/jest-helper';
import { SpyHelper } from './spy-helpers/spy-helper';

export class SpyHelperFactory {
    private static frameworks = {
        'jasmine': JasmineHelper,
        'jest': JestHelper
    };

    static get(framework: 'jasmine' | 'jest'): SpyHelper {
        return new this.frameworks[framework]();
    }
}
