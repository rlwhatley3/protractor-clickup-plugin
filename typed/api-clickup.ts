
import https from 'https';

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

export class Api {

	public config: any;

	private headers: any = { 'Authorization': '' };

	private options: any = {
		connection: 'keep-alive',
		gzip: true,
	  hostname: 'dev-api.clickup.com',
	  path: '/api/v1/',
	  port: 443
	}

	constructor(config?: any) {
		this.config = config;
		this.headers['Authorization'] = this.config.token;
		return this;
	};

	public async team(id: string|number): Promise<any> {
		if(!id) { console.error('ID required when using team lookup.'); }
		id = id.toString();
		let team = await this._teamRequest(id);
		return team;
	}

	private _teamRequest(id: string) {
		let localPath = `team/${id}`;
		let req = Object.assign(this.options, { path: this.options.path.concat(localPath), headers: this.headers });
		return new Promise((resolve, reject) => {
			https.get(req, (res) => {
				let chunks = [];
				res.on('data', data => {
					chunks.push(data);
				}).on('end', () => {
				  let data = Buffer.concat(chunks).toString();
				  let json = JSON.parse(data);
					if(json['team']) {
						resolve(json['team']);
					} else {
						reject(json);
					}
				});
			}).on('error', err => { 
				console.warn(`team request error: ${err}`);
				reject(err); 
			});
		});
	}

	public async teams(): Promise<[any]> {
		let teams = await this._teamsRequest();
		return teams;
	}

	private _teamsRequest(): Promise<[any]> {
		let localPath = 'team';
		let req = Object.assign({}, this.options, { path: this.options.path.concat(localPath), headers: this.headers });
		return new Promise((resolve, reject) => {
			https.get(req, (res) => {
				let chunks = [];
				res.on('data', data => {
				  chunks.push(data);
				}).on('end', () => {
				  let data = Buffer.concat(chunks).toString();
				  let json = JSON.parse(data);
					if(json['teams']) {
						resolve(json['teams']);
					} else {
						reject(json);
					}
				});
			}).on('error', err => { 
				console.warn(`teams request error: ${err}`); 
				reject(err); 
			});
		});
	}

	public async authorize(auth: IAuthData): Promise<any> {
		let token = await this._authorize(auth);
		this.config.token = token;
		this.headers['Authorization'] = this.config.token;
	}

	private _authorize(auth: IAuthData) {
		let localPath = 'oauth/token';

		// todo - add client_id, client_secret, and code query params
		let req = Object.assign({}, this.options, { path: this.options.path.concat(localPath), headers: this.headers, method: 'POST' });

		return new Promise((resolve, reject) => {
			https.request(req, (res) => {
				res.on('data', data => {
					let json = JSON.parse(data.toString());
					if(json['access_token']) {
						resolve(json['access_token']);
					} else {
						reject(json);
					}
				});
			}).on('error', err => { 
				console.warn(`authorization error: ${err}`); 
				reject(err);
			});
		});
	}

	private _userRequest(token?: string): Promise<any> {
		let localPath = 'user';
		let req = Object.assign({}, this.options, { path: this.options.path.concat(localPath), headers: this.headers });

		return new Promise((resolve, reject) => {
			https.get(req, (res) => {
				res.on('data', data => {
					let json = JSON.parse(data.toString());
					resolve(json);
				});
			}).on('error', err => { 
				console.warn('user request error: ', err); 
				reject(err); });
		});
	}

	public async user(): Promise<ICUser> {
		let user = await this._userRequest();
		return user;
	}

	private _createTask(task): Promise<any> {
		let localPath = 'task';

		// todo: 
		// 	implement actual request object usage
		// 	catch data properly, not sure how large some descriptions are going to get.
		// 	store this new task with relevance to any that may need to be attached to it as a parent
		let req = Object.assign({}, this.options, { path: this.options.path.concat(localPath), headers: this.headers, method: 'POST' });

		return new Promise((resolve, reject) => {
			https.request(req, (res) => {
				res.on('data', data => {
					let json = JSON.parse(data.toString());
					resolve(json);
				});
			}).on('error', err => { 
				console.warn(`create task error: ${err}`); 
				reject(err); });
		});
	}

	public async createTask(task): Promise<void|any> {
		let createdTask = await this._createTask(task);
		return createdTask;
	}

	public async create(event): Promise<void|any> {
		console.log('event: ', event);

		let task, subtask;
		switch(event.type) {
			case 'task':
				task = await this._createTask(event);
				break;
			case 'subtask':
				subtask = await this._createTask(event);
				break;
		}

		return subtask ? subtask : task;
	}
}
