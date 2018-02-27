"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const https_1 = __importDefault(require("https"));
class Api {
    constructor(config) {
        this.headers = { 'Authorization': '' };
        this.options = {
            connection: 'keep-alive',
            gzip: true,
            hostname: 'dev-api.clickup.com',
            path: '/api/v1/',
            port: 443
        };
        this.config = config;
        this.headers['Authorization'] = this.config.token;
        return this;
    }
    ;
    team(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!id) {
                console.error('ID required when using team lookup.');
            }
            id = id.toString();
            let team = yield this._teamRequest(id);
            return team;
        });
    }
    _teamRequest(id) {
        let localPath = `team/${id}`;
        let req = Object.assign(this.options, { path: this.options.path.concat(localPath), headers: this.headers });
        return new Promise((resolve, reject) => {
            https_1.default.get(req, (res) => {
                let chunks = [];
                res.on('data', data => {
                    chunks.push(data);
                }).on('end', () => {
                    let data = Buffer.concat(chunks).toString();
                    let json = JSON.parse(data);
                    if (json['team']) {
                        resolve(json['team']);
                    }
                    else {
                        reject(json);
                    }
                });
            }).on('error', err => {
                console.warn(`team request error: ${err}`);
                reject(err);
            });
        });
    }
    teams() {
        return __awaiter(this, void 0, void 0, function* () {
            let teams = yield this._teamsRequest();
            return teams;
        });
    }
    _teamsRequest() {
        let localPath = 'team';
        let req = Object.assign({}, this.options, { path: this.options.path.concat(localPath), headers: this.headers });
        return new Promise((resolve, reject) => {
            https_1.default.get(req, (res) => {
                let chunks = [];
                res.on('data', data => {
                    chunks.push(data);
                }).on('end', () => {
                    let data = Buffer.concat(chunks).toString();
                    let json = JSON.parse(data);
                    if (json['teams']) {
                        resolve(json['teams']);
                    }
                    else {
                        reject(json);
                    }
                });
            }).on('error', err => {
                console.warn(`teams request error: ${err}`);
                reject(err);
            });
        });
    }
    authorize(auth) {
        return __awaiter(this, void 0, void 0, function* () {
            let token = yield this._authorize(auth);
            this.config.token = token;
            this.headers['Authorization'] = this.config.token;
        });
    }
    _authorize(auth) {
        let localPath = 'oauth/token';
        let req = Object.assign({}, this.options, { path: this.options.path.concat(localPath), headers: this.headers, method: 'POST' });
        return new Promise((resolve, reject) => {
            https_1.default.request(req, (res) => {
                res.on('data', data => {
                    let json = JSON.parse(data.toString());
                    if (json['access_token']) {
                        resolve(json['access_token']);
                    }
                    else {
                        reject(json);
                    }
                });
            }).on('error', err => {
                console.warn(`authorization error: ${err}`);
                reject(err);
            });
        });
    }
    _userRequest(token) {
        let localPath = 'user';
        let req = Object.assign({}, this.options, { path: this.options.path.concat(localPath), headers: this.headers });
        return new Promise((resolve, reject) => {
            https_1.default.get(req, (res) => {
                res.on('data', data => {
                    let json = JSON.parse(data.toString());
                    resolve(json);
                });
            }).on('error', err => {
                console.warn('user request error: ', err);
                reject(err);
            });
        });
    }
    user() {
        return __awaiter(this, void 0, void 0, function* () {
            let user = yield this._userRequest();
            return user;
        });
    }
    _createTask(task) {
        let localPath = 'task';
        let req = Object.assign({}, this.options, { path: this.options.path.concat(localPath), headers: this.headers, method: 'POST' });
        return new Promise((resolve, reject) => {
            https_1.default.request(req, (res) => {
                res.on('data', data => {
                    let json = JSON.parse(data.toString());
                    resolve(json);
                });
            }).on('error', err => {
                console.warn(`create task error: ${err}`);
                reject(err);
            });
        });
    }
    createTask(task) {
        return __awaiter(this, void 0, void 0, function* () {
            let createdTask = yield this._createTask(task);
            return createdTask;
        });
    }
    create(event) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('event: ', event);
            let task, subtask;
            switch (event.type) {
                case 'task':
                    task = yield this._createTask(event);
                    break;
                case 'subtask':
                    subtask = yield this._createTask(event);
                    break;
            }
            return subtask ? subtask : task;
        });
    }
}
exports.Api = Api;
