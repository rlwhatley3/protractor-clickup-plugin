import { ICUser } from './api-clickup';
import { BehaviorSubject } from 'rxjs';
export interface ICUCreate {
    type: 'task' | 'subtask';
    parent_id: string;
    failure_status?: string;
    success_status?: string;
    priority?: '1' | '2' | '3' | '4';
    due_date?: string;
    assignees?: [string];
}
export interface ICUCreateWhen {
    type: 'failure' | 'success' | 'test';
    create: ICUCreate;
}
export interface ICUConfig {
    after_all?: ICUCreateWhen;
    after_each?: ICUCreateWhen;
    after_test?: ICUCreateWhen;
}
export declare class CUReporter {
    private token_config;
    private userValidated;
    name: string;
    private api;
    user$: BehaviorSubject<ICUser>;
    user: ICUser;
    teams$: BehaviorSubject<[any]>;
    uConfig: ICUConfig;
    constructor();
    setup(): void | Promise<void>;
    postTest(passed: boolean, testInfo: any): void | Promise<void>;
    onPrepare(): void | Promise<void>;
    teardown(): void;
    private _createTaskFromTest(createWhen, passed, testInfo);
    private _handleError(err);
}
