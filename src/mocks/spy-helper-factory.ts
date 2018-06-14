import { JasmineHelper } from './spy-helpers/jasmine-helper';
import { JestHelper } from './spy-helpers/jest-helper';
import { SpyHelper } from './spy-helpers/spy-helper';
import { SpyDetector } from '../spy-detector';

export class SpyHelperFactory {
    private static frameworks = {
        'jasmine': JasmineHelper,
        'jest': JestHelper
    };

    static get(): SpyHelper {
        return new this.frameworks[SpyDetector.detect()]();
    }
}
