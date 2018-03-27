export interface IAuthData {
    id: string;
    secret: string;
    code: string;
}
export interface ICUserContainer {
    user: ICUser;
}
export interface ICUser {
    id: string;
    username: string;
    color: string;
    profilePicture: string;
}
export declare class Api {
    config: any;
    constructor(config?: any);
    team(id: string | number): Promise<any>;
    private _teamRequest(id);
    teams(): Promise<[any]>;
    private _teamsRequest();
    authorize(auth: IAuthData): Promise<any>;
    private _authorize(auth);
    private _userRequest(token?);
    user(): Promise<ICUser>;
    batchUpdateTasks(tasks: any): Promise<any>;
    private _batchUpdateTasks(tasks);
    private _updateTask(task);
    private _batchCreateTasks(tasks);
    batchCreateTasks(tasks: any): Promise<any>;
    private _createTask(task);
    createTask(task: any): Promise<void | any>;
    private _uploadAttachment(image);
    uploadAttachment(image: any): Promise<void | any>;
    private _handleError(err);
}
