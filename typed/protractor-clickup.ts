import { Api, ICUser, ICUserContainer } from './api-clickup';

import { CUReporter } from './cu-reporter';

import { protractor, ProtractorPlugin, browser } from 'protractor';

import { jasmine } from 'jasmine';

import { BehaviorSubject } from 'rxjs';

import fs from 'fs';

export interface ICUCreate {
  type: 'task'|'subtask',
  parent?: string,
  list_id?: string,
  screenshot?: boolean,
  failureStatus?: string,
  successStatus?: string,
  priority?: '1'|'2'|'3'|'4',
  due_date?: string,
  assignees?: [string]
}

export interface ICUCreateWhen {
  type: 'failure'|'success'|'test',
  create: ICUCreate
}

export interface ICUConfig {
  token?: string,
  baseUrl?: string,
  defaultList?: string,
  usingJasmine: boolean,
  screenshotPath?: string,
  failureStatus?: string,
  successStatus?: string,
  after_all?: ICUCreateWhen,
  after_each?: ICUCreateWhen,
}

export interface IFail {
  matcherName: string;
  message: string;
  stack: string;
  passed: boolean;
  expected: string;
  actual: string;
}

export interface IPass {
  matcherName: string;
  message: string;
  stack: string;
  passed: boolean;
}

export interface IJSpec {
  id: string;
  description: string;
  fullName: string;
  failedExpectations: [IFail];
  passedExpectations: [IPass];
  pendingReason: string;
  duration: string;
  status: string;
  attachments?: [string];
}

export class CUPlugin {

  private userValidated: boolean = false;

  public name:string = 'Clickup';

  private api: Api;

  public user$: BehaviorSubject<ICUser> = new BehaviorSubject<ICUser>(null);

  public user: ICUser;

  public teams$: BehaviorSubject<[any]> = new BehaviorSubject<[any]>(null);

  public afterAllTasks$: BehaviorSubject<Array<any>> = new BehaviorSubject<Array<any>>([]);

  public uConfig: ICUConfig = { usingJasmine: true };

  public onPrepareDefer: any;
  private onCompleteDefer: any;
  private b;

  constructor() { return; }

  public configure(config:ICUConfig):void|CUPlugin {
    if(!config) { console.warn('No Configuration given for ClickUp Reporter!'); return; }
    if(!config.token) console.warn('No Authentication Token present in ClickUp Reporter configuration!');
    if(!(config.defaultList && config.defaultList.toString().length)) { console.warn('It is highly recommended to supply the ClickUp Plugin with a defaultList in the initial configuration.'); }

    this.uConfig = Object.assign(this.uConfig, config);

    this.api = new Api(this.uConfig);

    this.user$.filter(user => user !== null).subscribe(user => {
      this.user = user;
      if(this.user && this.user.id !== null) { this.userValidated = true };
    });

    this.api.user().then((user:ICUser) => {
      if(user && user.id !== null) { 
        this.userValidated = true 
        this.user$.next(user);
      };
      this.onPrepareDefer.fulfill();
    }, (err) => {
      this._handleError(err);
      this.onPrepareDefer.fulfill();
    });

    this.api.teams().then((teams: [any]) => {
      this.teams$.next(teams);
    }, this._handleError.bind(this));

    if(this.uConfig.usingJasmine) jasmine.getEnv().addReporter(this.reporter());

    return this;
  }

  public reporter():CUReporter { return new CUReporter(this); }

  public postResults() {}

  public postTest(passed: boolean, testInfo: any): void|Promise<void> {
    let activeConfig:ICUConfig = Object.assign({}, this.uConfig);
    if(activeConfig.usingJasmine) return;
    if(!this.userValidated) { 
      console.warn('User is not validated with ClickUp!'); 
      return;
    }
    // Will only create clickup tasks during postTest when usingJasmine is enabled (default), mostly for dev.
    if(activeConfig.after_each && activeConfig.after_each.type) { this._createTaskFromTest(activeConfig.after_each, passed, testInfo); }
    return;
  }

  public onPrepare():void|Promise<void> {
    this.b = browser;
    this.onPrepareDefer = protractor.promise.defer();
    this.onCompleteDefer = protractor.promise.defer();
    return;
  }

  public onComplete():void|Promise<void> { return this.onCompleteDefer.promise; }

  public teardown():void {}

  private _createTaskObject(result:IJSpec, aConfig:ICUCreateWhen) {
    let task = {};
    let content = '';
    if(result.failedExpectations && result.failedExpectations.length) {
      result.failedExpectations.forEach(exp => { content += `${exp.message}\n${exp.stack}\n`; });
    } else if(result.status === 'passed' || result.status === 'finished') {
      content = result.status;
    }

    switch (aConfig.type) {
      case 'failure':
        if(result.failedExpectations && result.failedExpectations.length) {
          Object.assign(task, {
            name: result.fullName || content,
            content: content,
            status: aConfig.create.failureStatus ? aConfig.create.failureStatus : 'open'
          });
        } else {
          return;
        }
        break;
      case 'success':
        if( result.status === 'passed' || !(result.failedExpectations && result.failedExpectations.length) ) {
          Object.assign(task, {
            name: result.fullName || content,
            content: content,
            status: aConfig.create.successStatus ? aConfig.create.successStatus : 'open'
          });
        } else {
          return;
        }
        break;
      case 'test':
        let stat;
        if(result.status === 'passed' || !(result.failedExpectations && result.failedExpectations.length)) {
          stat = aConfig.create.successStatus;
        } else if (result.failedExpectations && result.failedExpectations.length) {
          stat = aConfig.create.failureStatus;
        }

        if(!stat.length) stat = 'open';

        Object.assign(task, {
          name: result.fullName || content,
          content: content,
          status: stat
        });
        break;
      default:
        break;
    }// end switch

    if(task['name'] && task['name'].length) {
      Object.assign(task, {
        list_id: aConfig.create.list_id ? aConfig.create.list_id : this.uConfig.defaultList ? this.uConfig.defaultList : null,
      });
        // need proper params for these to work
        // assignees: aConfig.create.assignees ? aConfig.create.assignees : null,
        // priority: aConfig.create.priority ? aConfig.create.priority : null,
        // due_date: aConfig.create.due_date ? aConfig.create.due_date : null

      // subtasks are not implemented yet in the public api
      // parent: (aConfig.create.type === 'subtask') ? aConfig.create.parent : null,
      return task;
    } else {
      return null;
    }

  }

  public writeScreenShot(data, filename) {
    let stream = fs.createWriteStream(filename);
    stream.write(new Buffer(data, 'base64'));
    stream.end();
  }

  private _updateTaskObject(id, result, aConfig) {
    let status;
    let content = '';
    let passed = !(result.failedExpectations && result.failedExpectations.length)

    if(passed) {
      content = result.status;
      status = aConfig.successStatus ? aConfig.successStatus : 'open';
    } else {
      content = result.failedExpectations.forEach(exp => { content += `${exp.message}\n${exp.stack}\n`; });
      status = aConfig.failureStatus ? aConfig.failureStatus : 'open';
    }

    // will need to get screenshot, screencomparison, and priority sent with this
    return {
      id: id,
      content: content,
      status: status
    }
  }

  public analyzeSpec(result:IJSpec):void {
    if(!result) return;

    let aConfig = Object.assign({}, this.uConfig);

    let regex = /#(\w+)/gi;

    let taskIds = result.description.match(regex);

    if(taskIds) {
      taskIds = taskIds.map(match => match.split('#')[1]);
      let tasksToUpdate = taskIds.map((id) => { return this._updateTaskObject(id, result, aConfig); });
      this.api.batchUpdateTasks(tasksToUpdate);
    }

    if(aConfig.after_all) {
      let task = this._createTaskObject(result, aConfig.after_all);

      if(task) {
        if(aConfig.after_all.create && aConfig.after_all.create.screenshot) {
          this.b.takeScreenshot().then((png) => {
            this.writeScreenShot(png, `${aConfig.screenshotPath || ''}/${Date.now()}.png`);
            this.api.uploadAttachment(png).then(uploadId => {
              task['attachments'] = [uploadId];
              this.afterAllTasks$.next(this.afterAllTasks$.value.concat(task));
            });
          });
        } else {
          this.afterAllTasks$.next(this.afterAllTasks$.value.concat(task));
        }
      }
    }

    if(aConfig.after_each) {
      let task = this._createTaskObject(result, aConfig.after_each);

      if(task) {
        if(aConfig.after_each.create && aConfig.after_each.create.screenshot) {
          this.b.takeScreenshot().then(png => {
            this.writeScreenShot(png, `${aConfig.screenshotPath || ''}/${Date.now()}.png`);
            this.api.uploadAttachment(png).then(uploadId => {
              task['attachments'] = [uploadId];
              this.api.createTask(task);
            });
          });
        } else {
          this.api.createTask(task);
        }
      }
    }
  }

  public analyzeFinal(failed:Array<IJSpec>, passed:Array<IJSpec>):void {
    let aConfig = Object.assign({}, this.uConfig);
    if(!aConfig.after_all) {
      this.onCompleteDefer.fulfill();
      return;
    }

    let tasksToCreate = this.afterAllTasks$.value;

    if(tasksToCreate && tasksToCreate.length) {
      this.api.batchCreateTasks(this.afterAllTasks$.value).then((taskIds) => {
        this.onCompleteDefer.fulfill();
      }).catch((err) => {
        this._handleError(err);
        this.onCompleteDefer.fulfill();
      });
    } else {
      this.onCompleteDefer.fulfill();
    }

  }

  // used for when not usingJasmine
  private _createTaskFromTest(createWhen:ICUCreateWhen, passed:boolean, testInfo:any): void {
    let task = {};

    switch (createWhen.type) {
      case 'failure':
        if(!passed) { 
          Object.assign(task, {
            name: testInfo.category,
            content: testInfo.name ? testInfo.name : '',
            status: createWhen.create.failureStatus ? createWhen.create.failureStatus : 'open'
          });
        } else {
          return;
        }
        break;
      case 'success':
        if(passed) {
          Object.assign(task, {
            name: testInfo.category,
            content: testInfo.name,
            status: createWhen.create.successStatus ? createWhen.create.successStatus : 'open'
          });
        } else {
          return;
        }
        break;
      case 'test':
          Object.assign(task, {
            name: testInfo.category,
            content: testInfo.name ? testInfo.name : '',
            status: passed ? createWhen.create.successStatus : (createWhen.create.failureStatus ? createWhen.create.failureStatus : 'open')
          });
        break;
      default:
        break;
    }

    if(task['name'] && task['name'].length) {
      Object.assign(task, {
        list_id: createWhen.create.list_id,
      });

        // need to create proper params for these to work
        // assignees: createWhen.create.assignees ? createWhen.create.assignees : null,
        // priority: createWhen.create.priority ? createWhen.create.priority : null,
        // due_date: createWhen.create.due_date ? createWhen.create.due_date : null

        // not available in api yet
        // parent_id: (createWhen.create.type === 'subtask') ? createWhen.create.parent_id : null,
      this.api.createTask(task);
      
    } else {
    }
  }

  private _handleError(err) {
    if(err['err'] && err['ECODE']) { 
      console.warn(`protractor-clickup-plugin error: ${err['ECODE']}: ${err['err']}`);
    }
  }

}













