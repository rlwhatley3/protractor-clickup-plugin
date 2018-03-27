"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
class CUReporter {
    constructor(plugin) {
        this.startedSuites$ = new rxjs_1.BehaviorSubject([]);
        this.finishedSuites$ = new rxjs_1.BehaviorSubject([]);
        this.allSpecs$ = new rxjs_1.BehaviorSubject([]);
        this.failedSpecs$ = new rxjs_1.BehaviorSubject([]);
        this.passedSpecs$ = new rxjs_1.BehaviorSubject([]);
        this.CU = plugin;
        return this;
    }
    jasmineStarted(result) { this.totalSpecs = result.totalSpecsDefined; }
    suiteStarted(result) { this.startedSuites$.next(this.startedSuites$.value.concat(result)); }
    specStarted(result) { this.allSpecs$.next(this.startedSuites$.value.concat(result)); }
    specDone(result) {
        if (result.failedExpectations && result.failedExpectations.length) {
            this.failedSpecs$.next(this.failedSpecs$.value.concat(result));
        }
        else {
            this.passedSpecs$.next(this.passedSpecs$.value.concat(result));
        }
        this.CU.analyzeSpec(result);
    }
    suiteDone(result) {
        if (result.failedExpectations && result.failedExpectations.length) {
            this.failedSpecs$.next(this.failedSpecs$.value.concat(result)) && this.CU.analyzeSpec(result);
        }
        this.startedSuites$.next(this.startedSuites$.value.filter(ss => ss.id !== result.id));
        this.finishedSuites$.next(this.finishedSuites$.value.concat(result));
    }
    jasmineDone(result) {
        if (result.failedExpectations && result.failedExpectations.length) {
            this.failedSpecs$.next(this.failedSpecs$.value.concat(result)) && this.CU.analyzeSpec(result);
        }
        this.CU.analyzeFinal(this.failedSpecs$.value, this.passedSpecs$.value);
    }
}
exports.CUReporter = CUReporter;
