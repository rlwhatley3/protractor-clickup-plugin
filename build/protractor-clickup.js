"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const api_clickup_1 = require("./api-clickup");
const cu_reporter_1 = require("./cu-reporter");
const protractor_1 = require("protractor");
const jasmine_1 = require("jasmine");
const rxjs_1 = require("rxjs");
const fs_1 = __importDefault(require("fs"));
class CUPlugin {
    constructor() {
        this.userValidated = false;
        this.name = 'Clickup';
        this.user$ = new rxjs_1.BehaviorSubject(null);
        this.teams$ = new rxjs_1.BehaviorSubject(null);
        this.afterAllTasks$ = new rxjs_1.BehaviorSubject([]);
        this.uConfig = { usingJasmine: true };
        return;
    }
    configure(config) {
        if (!config) {
            console.warn('No Configuration given for ClickUp Reporter!');
            return;
        }
        if (!config.token)
            console.warn('No Authentication Token present in ClickUp Reporter configuration!');
        if (!(config.defaultTask && config.defaultTask.toString().length && config.defaultList && config.defaultList.toString().length)) {
            console.warn('It is highly recommended to supply the ClickUp Plugin with both a defaultTask and a defaultList in the initial configuration.');
        }
        this.uConfig = Object.assign(this.uConfig, config);
        this.api = new api_clickup_1.Api(this.uConfig);
        this.user$.filter(user => user !== null).subscribe(user => {
            this.user = user;
            if (this.user && this.user.id !== null) {
                this.userValidated = true;
            }
            ;
        });
        this.api.user().then((user) => {
            if (user && user.id !== null) {
                this.userValidated = true;
                this.user$.next(user);
            }
            ;
            this.onPrepareDefer.fulfill();
        }, (err) => {
            this._handleError(err);
            this.onPrepareDefer.fulfill();
        });
        this.api.teams().then((teams) => {
            this.teams$.next(teams);
        }, this._handleError.bind(this));
        if (this.uConfig.usingJasmine)
            jasmine.getEnv().addReporter(this.reporter());
        return this;
    }
    reporter() { return new cu_reporter_1.CUReporter(this); }
    postResults() { }
    postTest(passed, testInfo) {
        let activeConfig = Object.assign({}, this.uConfig);
        if (activeConfig.usingJasmine)
            return;
        if (!this.userValidated) {
            console.warn('User is not validated with ClickUp!');
            return;
        }
        if (activeConfig.after_each && activeConfig.after_each.type) {
            this._createTaskFromTest(activeConfig.after_each, passed, testInfo);
        }
        return;
    }
    onPrepare() {
        this.b = browser;
        this.onPrepareDefer = protractor.promise.defer();
        this.onCompleteDefer = protractor.promise.defer();
        return;
    }
    onComplete() { return this.onCompleteDefer.promise; }
    teardown() { }
    _createTaskObject(result, aConfig) {
        let task = {};
        let content = '';
        if (result.failedExpectations && result.failedExpectations.length) {
            result.failedExpectations.forEach(exp => { content += `${exp.message}\n${exp.stack}\n`; });
        }
        else if (result.status === 'passed' || result.status === 'finished') {
            content = result.status;
        }
        switch (aConfig.type) {
            case 'failure':
                if (result.failedExpectations && result.failedExpectations.length) {
                    Object.assign(task, {
                        name: result.fullName || content,
                        content: content,
                        status: aConfig.create.failureStatus ? aConfig.create.failureStatus : 'open'
                    });
                }
                else {
                    return;
                }
                break;
            case 'success':
                if (result.status === 'passed' || !(result.failedExpectations && result.failedExpectations.length)) {
                    Object.assign(task, {
                        name: result.fullName || content,
                        content: content,
                        status: aConfig.create.successStatus ? aConfig.create.successStatus : 'open'
                    });
                }
                else {
                    return;
                }
                break;
            case 'test':
                let stat;
                if (result.status === 'passed' || !(result.failedExpectations && result.failedExpectations.length)) {
                    stat = aConfig.create.successStatus;
                }
                else if (result.failedExpectations && result.failedExpectations.length) {
                    stat = aConfig.create.failureStatus;
                }
                if (!stat.length)
                    stat = 'open';
                Object.assign(task, {
                    name: result.fullName || content,
                    content: content,
                    status: stat
                });
                break;
            default:
                break;
        }
        if (task['name'] && task['name'].length) {
            Object.assign(task, {
                list_id: aConfig.create.list_id ? aConfig.create.list_id : this.uConfig.defaultList ? this.uConfig.defaultList : null,
                assignees: aConfig.create.assignees ? aConfig.create.assignees : null,
                priority: aConfig.create.priority ? aConfig.create.priority : null,
                due_date: aConfig.create.due_date ? aConfig.create.due_date : null
            });
            return task;
        }
        else {
            return null;
        }
    }
    writeScreenShot(data, filename) {
        let stream = fs_1.default.createWriteStream(filename);
        stream.write(new Buffer(data, 'base64'));
        stream.end();
    }
    _updateTaskObject(id, result, aConfig) {
        let status;
        let content = '';
        let passed = !(result.failedExpectations && result.failedExpectations.length);
        if (passed) {
            content = result.status;
            status = aConfig.successStatus ? aConfig.successStatus : 'open';
        }
        else {
            content = result.failedExpectations.forEach(exp => { content += `${exp.message}\n${exp.stack}\n`; });
            status = aConfig.failureStatus ? aConfig.failureStatus : 'open';
        }
        return {
            id: id,
            content: content,
            status: status
        };
    }
    analyzeSpec(result) {
        if (!result)
            return;
        let aConfig = Object.assign({}, this.uConfig);
        let regex = /#(\w+)/gi;
        let taskIds = result.description.match(regex);
        if (taskIds) {
            taskIds = taskIds.map(match => match.split('#')[1]);
            let tasksToUpdate = taskIds.map((id) => { return this._updateTaskObject(id, result, aConfig); });
            this.api.batchUpdateTasks(tasksToUpdate);
        }
        if (aConfig.after_all) {
            let task = this._createTaskObject(result, aConfig.after_all);
            if (task) {
                if (aConfig.after_all.create && aConfig.after_all.create.screenshot) {
                    this.b.takeScreenshot().then((png) => {
                        this.writeScreenShot(png, `${aConfig.screenshotPath || ''}/${Date.now()}.png`);
                        this.api.uploadAttachment(png).then(uploadId => {
                            task['attachments'] = [uploadId];
                            this.afterAllTasks$.next(this.afterAllTasks$.value.concat(task));
                        });
                    });
                }
                else {
                    this.afterAllTasks$.next(this.afterAllTasks$.value.concat(task));
                }
            }
        }
        if (aConfig.after_each) {
            let task = this._createTaskObject(result, aConfig.after_each);
            if (task) {
                if (aConfig.after_each.create && aConfig.after_each.create.screenshot) {
                    this.b.takeScreenshot().then(png => {
                        this.writeScreenShot(png, `${aConfig.screenshotPath || ''}/${Date.now()}.png`);
                        this.api.uploadAttachment(png).then(uploadId => {
                            task['attachments'] = [uploadId];
                            this.api.createTask(task);
                        });
                    });
                }
                else {
                    this.api.createTask(task);
                }
            }
        }
    }
    analyzeFinal(failed, passed) {
        let aConfig = Object.assign({}, this.uConfig);
        if (!aConfig.after_all) {
            this.onCompleteDefer.fulfill();
            return;
        }
        let tasksToCreate = this.afterAllTasks$.value;
        if (tasksToCreate && tasksToCreate.length) {
            this.api.batchCreateTasks(this.afterAllTasks$.value).then((taskIds) => {
                this.onCompleteDefer.fulfill();
            }).catch((err) => {
                this._handleError(err);
                this.onCompleteDefer.fulfill();
            });
        }
        else {
            this.onCompleteDefer.fulfill();
        }
    }
    _createTaskFromTest(createWhen, passed, testInfo) {
        let task = {};
        switch (createWhen.type) {
            case 'failure':
                if (!passed) {
                    Object.assign(task, {
                        name: testInfo.category,
                        content: testInfo.name ? testInfo.name : '',
                        status: createWhen.create.failureStatus ? createWhen.create.failureStatus : 'open'
                    });
                }
                else {
                    return;
                }
                break;
            case 'success':
                if (passed) {
                    Object.assign(task, {
                        name: testInfo.category,
                        content: testInfo.name,
                        status: createWhen.create.successStatus ? createWhen.create.successStatus : 'open'
                    });
                }
                else {
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
        if (task['name'] && task['name'].length) {
            Object.assign(task, {
                list_id: createWhen.create.list_id,
                assignees: createWhen.create.assignees ? createWhen.create.assignees : null,
                priority: createWhen.create.priority ? createWhen.create.priority : null,
                due_date: createWhen.create.due_date ? createWhen.create.due_date : null
            });
            this.api.createTask(task);
        }
        else {
        }
    }
    _handleError(err) {
        if (err['err'] && err['ECODE']) {
            console.warn(`protractor-clickup-plugin error: ${err['ECODE']}: ${err['err']}`);
        }
    }
}
exports.CUPlugin = CUPlugin;
