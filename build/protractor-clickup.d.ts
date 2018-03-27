import { ICUser } from './api-clickup';
import { CUReporter } from './cu-reporter';
import { BehaviorSubject } from 'rxjs';
export interface ICUCreate {
    type: 'task' | 'subtask';
    parent?: string;
    list_id?: string;
    screenshot?: boolean;
    failureStatus?: string;
    successStatus?: string;
    priority?: '1' | '2' | '3' | '4';
    due_date?: string;
    assignees?: [string];
}
export interface ICUCreateWhen {
    type: 'failure' | 'success' | 'test';
    create: ICUCreate;
}
export interface ICUConfig {
    token?: string;
    baseUrl?: string;
    defaultList?: string;
    defaultTask?: string;
    usingJasmine: boolean;
    screenshotPath?: string;
    clearList?: boolean;
    failureStatus?: string;
    successStatus?: string;
    after_all?: ICUCreateWhen;
    after_each?: ICUCreateWhen;
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
export declare class CUPlugin {
    private userValidated;
    name: string;
    private api;
    user$: BehaviorSubject<ICUser>;
    user: ICUser;
    teams$: BehaviorSubject<[any]>;
    afterAllTasks$: BehaviorSubject<Array<any>>;
    uConfig: ICUConfig;
    onPrepareDefer: any;
    private onCompleteDefer;
    private b;
    constructor();
    configure(config: ICUConfig): void | CUPlugin;
    reporter(): CUReporter;
    postResults(): void;
    postTest(passed: boolean, testInfo: any): void | Promise<void>;
    onPrepare(): void | Promise<void>;
    onComplete(): void | Promise<void>;
    teardown(): void;
    private _createTaskObject(result, aConfig);
    writeScreenShot(data: any, filename: any): void;
    private _updateTaskObject(id, result, aConfig);
    analyzeSpec(result: IJSpec): void;
    analyzeFinal(failed: Array<IJSpec>, passed: Array<IJSpec>): void;
    private _createTaskFromTest(createWhen, passed, testInfo);
    private _handleError(err);
}
