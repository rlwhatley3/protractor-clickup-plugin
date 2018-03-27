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
const axios_1 = __importDefault(require("axios"));
class Api {
    constructor(config) {
        this.config = config;
        axios_1.default.defaults.baseURL = this.config.baseUrl ? this.config.baseUrl : 'https://api.clickup.com/api/v1';
        axios_1.default.defaults.headers.common['Authorization'] = this.config.token;
        axios_1.default.defaults.headers.post['Content-Type'] = 'application/json';
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
        return axios_1.default.get(localPath)
            .then((team) => { return team.data.team; })
            .catch(this._handleError.bind(this));
    }
    teams() {
        return __awaiter(this, void 0, void 0, function* () {
            let teams = yield this._teamsRequest();
            return teams;
        });
    }
    _teamsRequest() {
        let localPath = 'team';
        return axios_1.default.get(localPath)
            .then((teams) => { return teams.data.teams; })
            .catch(this._handleError.bind(this));
    }
    authorize(auth) {
        return __awaiter(this, void 0, void 0, function* () {
            let token = yield this._authorize(auth);
            this.config.token = token;
            axios_1.default.defaults.headers.common['Authorization'] = this.config.token;
        });
    }
    _authorize(auth) {
        let localPath = 'oauth/token';
        return axios_1.default.post(localPath)
            .then((data) => { return data.data.access_token; })
            .catch(this._handleError.bind(this));
    }
    _userRequest(token) {
        let localPath = 'user';
        return axios_1.default.get(localPath)
            .then((userContainer) => { return userContainer.data; })
            .catch(this._handleError.bind(this));
    }
    user() {
        return __awaiter(this, void 0, void 0, function* () {
            let userContainer = yield this._userRequest();
            return userContainer.user;
        });
    }
    batchUpdateTasks(tasks) {
        return __awaiter(this, void 0, void 0, function* () {
            let updated = yield this._batchUpdateTasks(tasks);
            return updated;
        });
    }
    _batchUpdateTasks(tasks) {
        let toUpdate = [];
        tasks.forEach((task) => { toUpdate.push(this._updateTask(task)); });
        return axios_1.default.all(toUpdate).then(data => {
            return data;
        }).catch(this._handleError.bind(this));
    }
    _updateTask(task) {
        if (!(task && task.id)) {
            console.error('No Task Id given for update');
            return;
        }
        let localPath = `/task/${task.id}`;
        return axios_1.default.put(localPath, task)
            .then((u) => { return u.data; })
            .catch(this._handleError.bind(this));
    }
    _batchCreateTasks(tasks) {
        let toCreate = [];
        tasks.forEach((task) => { toCreate.push(this._createTask(task)); });
        return axios_1.default.all(toCreate).then((data) => {
            return data;
        }).catch(this._handleError.bind(this));
    }
    batchCreateTasks(tasks) {
        return __awaiter(this, void 0, void 0, function* () {
            let newTasks = yield this._batchCreateTasks(tasks);
            return newTasks;
        });
    }
    _createTask(task) {
        let localPath = `/list/${task.list_id.toString()}/task`;
        return axios_1.default.post(localPath, task)
            .then((taskId) => { return taskId.data; })
            .catch(this._handleError.bind(this));
    }
    createTask(task) {
        return __awaiter(this, void 0, void 0, function* () {
            let createdTask = yield this._createTask(task);
            return createdTask;
        });
    }
    _uploadAttachment(image) {
        return new Promise((resolve, reject) => {
            console.log('fake uploading attachment...');
            resolve('1234');
        });
    }
    uploadAttachment(image) {
        return __awaiter(this, void 0, void 0, function* () {
            let uploadId = this._uploadAttachment(image);
            return uploadId;
        });
    }
    _handleError(err) {
        if (err['err'] && err['ECODE']) {
            console.warn(`protractor-clickup api error: ${err['ECODE']}: ${err['err']}`);
        }
    }
}
exports.Api = Api;
