export interface IAuthData {
    id: string;
    secret: string;
    code: string;
}
export interface ICUser {
    id: string;
    username: string;
    color: string;
    profilePicture: string;
}
export declare class Api {
    config: any;
    private headers;
    private options;
    constructor(config?: any);
    team(id: string | number): Promise<any>;
    private _teamRequest(id);
    teams(): Promise<[any]>;
    private _teamsRequest();
    authorize(auth: IAuthData): Promise<any>;
    private _authorize(auth);
    private _userRequest(token?);
    user(): Promise<ICUser>;
    private _createTask(task);
    createTask(task: any): Promise<void | any>;
    create(event: any): Promise<void | any>;
}
