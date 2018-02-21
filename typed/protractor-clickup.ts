
// config options
// 1. send on each test (postTest)
// 2. send at the very end (postResults)

// import Api from './api-clickup';

export class Clickup {

  config: { token: 'pk_KGJPNLQ6J0DX1Y2JE3PC9ANDKOXGB1OY' };

  public name:string =  'Clickup';

  // public api: Api;

  private setup():void|Promise<void> {
    // this.api = new Api(this.config);
    // send api request to clickup to validate token key

    // this.api.user().then(user => {
    //   console.log('user: ', user);
    // }, err => {
    //   console.log('failed to fetch user: ', user);
    // });

    console.log('hais');
    console.log('config: ', this.config);
  }

  public onPrepare():void|Promise<void> {

  }

  public teardown():void {

  }


}

// let Clickup = {
//   /**
//    * Sets up plugins before tests are run. This is called after the WebDriver
//    * session has been started, but before the test framework has been set up.
//    *
//    * @this {Object} bound to module.exports.
//    *
//    * @throws {*} If this function throws an error, a failed assertion is added to
//    *     the test results.
//    *
//    * @return {Promise=} Can return a promise, in which case protractor will wait
//    *     for the promise to resolve before continuing.  If the promise is
//    *     rejected, a failed assertion is added to the test results.
//    **/
//   // setup?(): void|Promise<void>;
// 	setup: () => {
//     // send api request to clickup -> verify the key is valid, and that the users has access
//     // to the lists they intend to use
// 	},
//     /**
//    * This is called before the test have been run but after the test framework has
//    * been set up.  Analogous to a config file's `onPreare`.
//    *
//    * Very similar to using `setup`, but allows you to access framework-specific
//    * variables/funtions (e.g. `jasmine.getEnv().addReporter()`).
//    *
//    * @this {Object} bound to module.exports.
//    *
//    * @throws {*} If this function throws an error, a failed assertion is added to
//    *     the test results.
//    *
//    * @return {Promise=} Can return a promise, in which case protractor will wait
//    *     for the promise to resolve before continuing.  If the promise is
//    *     rejected, a failed assertion is added to the test results.
//    */
//   // onPrepare?(): void|Promise<void>;
// 	onPrepare: () => {
// 	},
//     /**
//    * This is called inside browser.get() directly after the page loads, and before
//    * angular bootstraps.
//    *
//    * @param {ProtractorBrowser} browser The browser instance which is loading a page.
//    *
//    * @this {Object} bound to module.exports.
//    *
//    * @throws {*} If this function throws an error, a failed assertion is added to
//    *     the test results.
//    *
//    * @return {webdriver.promise.Promise=} Can return a promise, in which case
//    *     protractor will wait for the promise to resolve before continuing.  If
//    *     the promise is rejected, a failed assertion is added to the test results.
//    */
//   // onPageLoad?(browser: ProtractorBrowser): void|webdriver.promise.Promise<void>;
//   onPageLoad: (browser:any) => {
//   },
//   teardown: () => {
//   }


//   *
//    * Called after the test results have been finalized and any jobs have been
//    * updated (if applicable).
//    *
//    * @this {Object} bound to module.exports.
//    *
//    * @throws {*} If this function throws an error, it is outputted to the console.
//    *     It is too late to add a failed assertion to the test results.
//    *
//    * @return {Promise=} Can return a promise, in which case protractor will wait
//    *     for the promise to resolve before continuing.  If the promise is
//    *     rejected, an error is logged to the console.
   
//   // postResults?(): void|Promise<void>;



//   /**
//    * Called after each test block (in Jasmine, this means an `it` block)
//    * completes.
//    *
//    * @param {boolean} passed True if the test passed.
//    * @param {Object} testInfo information about the test which just ran.
//    *
//    * @this {Object} bound to module.exports.
//    *
//    * @throws {*} If this function throws an error, a failed assertion is added to
//    *     the test results.
//    *
//    * @return {Promise=} Can return a promise, in which case protractor will wait
//    *     for the promise to resolve before outputting test results.  Protractor
//    *     will *not* wait before executing the next test, however.  If the promise
//    *     is rejected, a failed assertion is added to the test results.
//    */
//   // postTest?(passed: boolean, testInfo: any): void|Promise<void>;



//   /**
//    * Used to turn off default checks for angular stability
//    *
//    * Normally Protractor waits for all $timeout and $http calls to be processed
//    * before executing the next command.  This can be disabled using
//    * browser.ignoreSynchronization, but that will also disable any
//    * <Plugin>.waitForPromise or <Plugin>.waitForCondition checks.  If you want
//    * to disable synchronization with angular, but leave intact any custom plugin
//    * synchronization, this is the option for you.
//    *
//    * This is used by plugin authors who want to replace Protractor's
//    * synchronization code with their own.
//    *
//    * @type {boolean}
//    */
//   // skipAngularStability?: boolean;

//     /**
//    * The name of the plugin.  Used when reporting results.
//    *
//    * If you do not specify this property, it will be filled in with something
//    * reasonable (e.g. the plugin's path) by Protractor at runtime.
//    *
//    * @type {string}
//    */
//   // name?: string;

//   /**
//    * The plugin's configuration object.
//    *
//    * Note: this property is added by Protractor at runtime.  Any pre-existing
//    * value will be overwritten.
//    *
//    * Note: that this is not the entire Protractor config object, just the entry
//    * in the `plugins` array for this plugin.
//    *
//    * @type {Object}
//    */
//   // config?: PluginConfig;
// }

// module.exports = Clickup;














