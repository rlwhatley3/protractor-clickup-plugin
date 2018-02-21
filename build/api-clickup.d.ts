export declare class Api {
    config: any;
    private headers;
    private options;
    constructor(config: any);
    private _userRequest(token?);
    user(): Promise<any>;
}
