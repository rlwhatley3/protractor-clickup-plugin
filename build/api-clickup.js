"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
}
Object.defineProperty(exports, "__esModule", { value: true });
const https = __importStar(require("https"));
class Api {
    constructor(config) {
        this.options = {
            hostname: 'dev-api.clickup.com',
            port: 80,
            path: '/'
        };
        this.config = config;
        this.headers['Authorization'] = config.token;
        return this;
    }
    ;
    _userRequest(token) {
        let req = Object.assign({ path: '/api/v1/user', method: 'GET', headers: this.headers }, this.options);
        return new Promise((resolve, reject) => {
            https.get(req, (res) => {
                console.log('https response: ', res);
                resolve(res);
            }).on('error', err => { reject(err); });
        });
    }
    user() {
        return __awaiter(this, void 0, void 0, function* () {
            let user = yield this._userRequest();
            return user;
        });
    }
}
exports.Api = Api;
