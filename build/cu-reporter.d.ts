export declare class CUReporter {
    private totalSpecs;
    private CU;
    private startedSuites$;
    private finishedSuites$;
    private allSpecs$;
    private failedSpecs$;
    private passedSpecs$;
    constructor(plugin: any);
    jasmineStarted(result: any): void;
    suiteStarted(result: any): void;
    specStarted(result: any): void;
    specDone(result: any): void;
    suiteDone(result: any): void;
    jasmineDone(result: any): void;
}
