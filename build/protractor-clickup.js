"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_clickup_1 = require("./api-clickup");
const rxjs_1 = require("rxjs");
class CUReporter {
    constructor() {
        this.userValidated = false;
        this.name = 'Clickup';
        this.user$ = new rxjs_1.BehaviorSubject(null);
        this.teams$ = new rxjs_1.BehaviorSubject(null);
        this.token_config = { token: 'pk_KGJPNLQ6J0DX1Y2JE3PC9ANDKOXGB1OY' };
        this.api = new api_clickup_1.Api(this.token_config);
        this.user$.filter(user => user !== null).subscribe(user => {
            this.user = user;
            if (this.user && this.user.id) {
                this.userValidated = true;
            }
            ;
        });
    }
    setup() {
        this.api.user().then((user) => {
            this.user$.next(user);
        }, this._handleError.bind(this));
        this.api.teams().then((teams) => {
            this.teams$.next(teams);
        }, this._handleError.bind(this));
        let creation_method = {
            type: 'task',
            parent_id: '1'
        };
        let config = {
            after_all: {
                type: 'test',
                create: creation_method
            },
            after_each: {
                type: 'failure',
                create: creation_method
            }
        };
        this.uConfig = config;
    }
    postTest(passed, testInfo) {
        if (!this.userValidated) {
            console.warn('No valid access token for ClickUp');
            return;
        }
        let activeConfig;
        let creation_method = {
            type: 'task',
            parent_id: '2'
        };
        let testConfig = {
            after_all: {
                type: 'test',
                create: creation_method
            },
            after_test: {
                type: 'failure',
                create: creation_method
            }
        };
        activeConfig = Object.assign({}, this.uConfig, testConfig);
        if (activeConfig.after_test && activeConfig.after_test.type) {
            this._createTaskFromTest(activeConfig.after_test, passed, testInfo);
        }
        return;
    }
    onPrepare() {
    }
    teardown() {
    }
    _createTaskFromTest(createWhen, passed, testInfo) {
        let task;
        switch (createWhen.type) {
            case 'failure':
                if (!passed) {
                    Object.assign(task, {
                        name: testInfo.failure_message,
                        content: testInfo.errors ? testInfo.errors : '',
                        status: createWhen.create.failure_status ? createWhen.create.failure_status : 'open'
                    });
                }
                break;
            case 'success':
                if (passed) {
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
        this.api.createTask(task);
    }
    _handleError(err) {
        if (err['err'] && err['ECODE']) {
            console.warn(`clickup-protractor error: ${err['ECODE']}: ${err['err']}`);
        }
    }
}
exports.CUReporter = CUReporter;
