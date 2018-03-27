
import { Api, ICUser } from './api-clickup';

import { CUPlugin, IJSpec, IFail, IPass } from './protractor-clickup';

import { BehaviorSubject } from 'rxjs';


export class CUReporter {

	private totalSpecs: number;

	private CU:CUPlugin;

	private startedSuites$:BehaviorSubject<Array<IJSpec>> = new BehaviorSubject<Array<IJSpec>>([]);
	private finishedSuites$:BehaviorSubject<Array<IJSpec>> = new BehaviorSubject<Array<IJSpec>>([]);

  private allSpecs$:BehaviorSubject<Array<IJSpec>> = new BehaviorSubject<Array<IJSpec>>([]);
  private failedSpecs$:BehaviorSubject<Array<IJSpec>> = new BehaviorSubject<Array<IJSpec>>([]);
  private passedSpecs$:BehaviorSubject<Array<IJSpec>> = new BehaviorSubject<Array<IJSpec>>([]); 


	constructor(plugin) {
		this.CU = plugin;
		return this;
	}

 //                      // jasmine reporter functions \\
  // jasmineStarted is called after all of the specs have been loaded, but just before execution starts.
  // suiteInfo contains a property that tells how many specs have been defined
		// result:  { 
		//   totalSpecsDefined: 17,
		//   order: Order { random: false, seed: '02328', sort: [Function: naturalOrder] } 
		// }
  public jasmineStarted(result) { this.totalSpecs = result.totalSpecsDefined; }

  // suiteStarted is invoked when a describe starts to run the result contains some meta data about the suite itself.

	// result:  { 
	// 	id: 'suite5',
	//   description: 'entering email and password',
	//   fullName: 'chrome - Login page entering email and password',
	//   failedExpectations: [] 
	// }
  public suiteStarted(result):void { this.startedSuites$.next(this.startedSuites$.value.concat(result)); }

  // specStarted is invoked when an it starts to run (including associated beforeEach functions)
	// result:  { 
	// 	id: 'spec8',
	//   description: 'it should show required error if no email present',
	//   fullName: 'chrome - Login page entering email and password it should show required error if no email present',
	//   failedExpectations: [],
	//   passedExpectations: [],
	//   pendingReason: '' 
	// }
  public specStarted(result) { this.allSpecs$.next(this.startedSuites$.value.concat(result)); }

  // specDone is invoked when an it and its associated beforeEach and afterEach functions have been run.
  public specDone(result) {
  	if(result.failedExpectations && result.failedExpectations.length) {
  		this.failedSpecs$.next(this.failedSpecs$.value.concat(result));
  	} else {
  		this.passedSpecs$.next(this.passedSpecs$.value.concat(result));
  	}
  	this.CU.analyzeSpec(result);
  }

  // suiteDone is invoked when all of the child specs and suites for a given suite have been run
  // While jasmine doesn't require any specific functions, 
  // not defining a suiteDone will make it impossible for a reporter to know when a suite has failures in an afterAll.
  // 	result:  { 
	 //  	id: 'suite1',
		//   description: 'chrome - Login page -> forgot password page',
		//   fullName: 'chrome - Login page -> forgot password page',
		//   failedExpectations: [],
		//   status: 'finished' 
		// }
  public suiteDone(result) {
  	if(result.failedExpectations && result.failedExpectations.length) { this.failedSpecs$.next(this.failedSpecs$.value.concat(result)) && this.CU.analyzeSpec(result); }
  	this.startedSuites$.next(this.startedSuites$.value.filter(ss => ss.id !== result.id));
	  this.finishedSuites$.next(this.finishedSuites$.value.concat(result));
  }

  // When the entire suite has finished execution jasmineDone is called
	  //   result:  { 
  //   	order: Order { random: false, seed: '02328', sort: [Function: naturalOrder] },
	//    failedExpectations: [] 
	//	 }
  public jasmineDone(result) {
  	if(result.failedExpectations && result.failedExpectations.length) { this.failedSpecs$.next(this.failedSpecs$.value.concat(result)) && this.CU.analyzeSpec(result); }
  	this.CU.analyzeFinal(this.failedSpecs$.value, this.passedSpecs$.value);
  }
}