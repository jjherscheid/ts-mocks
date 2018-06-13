export class SpyDetector {
    public static detect(): 'jasmine' | 'jest' {
        if ((window as any).__karma__) {
            return 'jasmine';
        }
        return 'jest';
    }
}
