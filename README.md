# Protractor-clickup-plugin
---

### Installation

- Install protractor-clickup-plugin via npm

`npm install protractor-clickup-plugin --save-dev`

- Add the plugin to the configuration file and provide a configuration for ClickUp.

```
exports.config = {
    'specs': [
      'example_spec.js'
    ],
    // add the plugin to the list of plugins
    plugins:[{
      package: 'protractor-clickup-plugin'
  	}],
    onPrepare: function() {

	  const creation_method = {
        type: 'task',
        list_id: '65583',
        failureStatus: 'issue found',
        successStatus: 'passed'
      }
      
      let config = {
        token: 'YOUR-CLICKUP-TOKEN-HERE',
        defaultList: '65583',
        successStatus: 'passed-tagged',
        failureStatus: 'failed-tagged',
        after_each: {
          type: 'test'|'success'|'failure',
          create: creation_method
        },
        after_all: {
          type: 'test'|'success'|failure',
          create: creation_method,
        }
      }

	    // configure CU 
      CU.configure(config);

      // return the promise for onPrepare to ensure user validation calls
      return CU.onPrepareDefer.promise;
    },
    onComplete: function() {
      // return completion promise to ensure all calls are finished
      return CU.onCompleteDefer.promise;
    }
};
```
	
### Options

The configuration object requires only a token, but we recommend providing a `defaultList` as well. There are 2 ways to create new ClickUp Tasks for your test suites as well as the option to directly link a suite to a ClickUp Task. The life cycle creation methods are also given in the primary configuration. They are not exclusive and all forms of Task creation/linking may be used in conjunction with one another.

#### Task Linking
When writing 'it' blocks placing a `#` followed by the ClickUp Task id you wish to link to ie `#r234`, will update the given Task with the latest test results. Note when using this method, task names are not updated. Only the task description and status. The tasks description is overwritten with the latest test outcome. The `successStatus` and `failureStatus` options provided on the primary configuration are used to set the statuses for linked Tasks. Linked Tasks are evaluated and updated after each spec.


#### Life cycle creation methods

##### after_each
after_each will create a new ClickUp Task after each spec ('it' block). The configuration requires that `type` and `create` fields be provided. 

The `type` determines when a Task will be created with regard to the specs success or failure. If the option of `test` is provided, Tasks will be created for both failing and successful specs. The `create` field is the configuration providing for how the Tasks will be created for that lifecyle event. The `type` of `task` denotes that a new Task will be created. A `list_id` is required for Task creation. A `failureStatus` and `successStatus` may be given, if none are provided, Tasks will be created in the `open` status.


##### after_all
after_all will create any new ClickUp Tasks after all specs have been run. The same configuration is required as after_each.













