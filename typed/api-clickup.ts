
import * as http from 'http';
import * as https from 'https';

export class Api {

	public config: any;

	private	headers: {
		'Content-Type' : 'application/x-www-form-urlencoded',
		'Authorization': ''
	};


	private options: any = {
	  hostname: 'dev-api.clickup.com',
	  port: 80,
	  path: '/'
	}

	constructor(config: any) {
		this.config = config;
		this.headers['Authorization'] = config.token;
		return this;
	};

	private _userRequest(token?: string): Promise<any> {
		let req = Object.assign(this.options, { path: '/api/v1/user', method: 'GET', headers: this.headers });

		return new Promise((resolve, reject) => {
			https.get(req, (res) => {
				console.log('https response: ', res);
				resolve(res);
			}).on('error', err => { reject(err) });
		});
	}


	async user(): Promise<any> {
		let user = await this._userRequest();
		return user;
	}
}

// module.exports = new api;