
// config options
// 1. send on each test (postTest)
// 2. send at the very end (postResults)

import { Api, ICUser } from './api-clickup';

import { BehaviorSubject } from 'rxjs';

export interface ICUCreate {
  type: 'task'|'subtask',
  parent_id: string
  failure_status?: string,
  success_status?: string,
  priority?: '1'|'2'|'3'|'4',
  due_date?: string,
  assignees?: [string]
}

export interface ICUCreateWhen {
  type: 'failure'|'success'|'test',
  create: ICUCreate
}

export interface ICUConfig {
  after_all?: ICUCreateWhen,
  after_each?: ICUCreateWhen,
  after_test?: ICUCreateWhen
}


export class CUReporter {

  private token_config: { token: 'pk_KGJPNLQ6J0DX1Y2JE3PC9ANDKOXGB1OY' };

  private userValidated: boolean = false;

  public name:string = 'Clickup';

  private api: Api;

  public user$: BehaviorSubject<ICUser> = new BehaviorSubject<ICUser>(null);

  public user: ICUser;

  public teams$: BehaviorSubject<[any]> = new BehaviorSubject<[any]>(null);

  public uConfig: ICUConfig;

  constructor() {
    this.token_config = { token: 'pk_KGJPNLQ6J0DX1Y2JE3PC9ANDKOXGB1OY' }
    this.api = new Api(this.token_config);

    this.user$.filter(user => user !== null).subscribe(user => {
      this.user = user;
      if(this.user && this.user.id) { this.userValidated = true };
    });
  }

  public setup():void|Promise<void> {
    this.api.user().then((user:ICUser) => {
      this.user$.next(user);
      // console.log('got user: ', this.user$.value);
    }, this._handleError.bind(this));

    this.api.teams().then((teams: [any]) => {
      this.teams$.next(teams);
      // console.log('got teams: ', this.teams$.value);
    }, this._handleError.bind(this));

    let creation_method:ICUCreate = {
      type: 'task',
      parent_id: '1'
    }

    let config:ICUConfig = {
      after_all: {
        type: 'test',
        create: creation_method
      },
      after_each: {
        type: 'failure',
        create: creation_method
      }
    }

    this.uConfig = config;

  }

  // called after every 'it', not after every expectation;
  public postTest(passed: boolean, testInfo: any): void|Promise<void> {

    if(!this.userValidated) { 
      console.warn('No valid access token for ClickUp!'); 
      return; 
    }

    // TODO: pull in this config any time a user specifies it. 
    // add single-override vs suite-override vs overwrite
    let activeConfig: ICUConfig;

    // ------------------------testing
    let creation_method: ICUCreate = {
      type: 'task',
      parent_id: '2'
    }

    let testConfig:ICUConfig = {
      after_all: {
        type: 'test',
        create: creation_method
      },
      after_test: {
        type: 'failure',
        create: creation_method 
      }
    };

    //--------------- --------testing

    activeConfig = Object.assign({}, this.uConfig, testConfig);

    if(activeConfig.after_test && activeConfig.after_test.type) { this._createTaskFromTest(activeConfig.after_test, passed, testInfo); }

    return;

  }

  public onPrepare():void|Promise<void> {

  }

  public teardown():void {

  }

  // build out task object here
  private _createTaskFromTest(createWhen:ICUCreateWhen, passed:boolean, testInfo:any): void {
    let task;

    switch (createWhen.type) {
      case 'failure':
        if(!passed) { 
          Object.assign(task, {
            name: testInfo.failure_message,
            content: testInfo.errors ? testInfo.errors : '',
            status: createWhen.create.failure_status ? createWhen.create.failure_status : 'open'
          });
        }
        break;
      case 'success':
        if(passed) {
          Object.assign(task, {
            name: testInfo.message,
            content: '',
            status: createWhen.create.success_status ? createWhen.create.success_status : 'open'
          });
        }
        break;
      case 'test':
          Object.assign(task, {
            name: testInfo.failure_message ? testInfo.failure_message : testInfo.message,
            content: testInfo.errors ? testInfo.errors : '',
            status: passed ? createWhen.create.success_status : (createWhen.create.failure_status ? createWhen.create.failure_status : 'open')
          });
        break;
      default:
        break;
    }

    Object.assign(task, {
      list_id: createWhen.create.type === 'task' ? createWhen.create.parent_id : null,
      parent_id: (createWhen.create.type === 'subtask') ? createWhen.create.parent_id : null,
      assignees: createWhen.create.assignees ? createWhen.create.assignees : null,
      priority: createWhen.create.priority ? createWhen.create.priority : null,
      due_date: createWhen.create.due_date ? createWhen.create.due_date : null
    });

    // insert duplication syncing call here;

    this.api.createTask(task);
  }

  private _handleError(err) {
    if(err['err'] && err['ECODE']) { 
      console.warn(`clickup-protractor error: ${err['ECODE']}: ${err['err']}`);
    }
  }

}













