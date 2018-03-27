import axios from 'axios';

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

export class Api {

	public config: any;

	constructor(config?: any) {
		this.config = config;

		axios.defaults.baseURL = this.config.baseUrl ? this.config.baseUrl : 'https://api.clickup.com/api/v1';
		axios.defaults.headers.common['Authorization'] = this.config.token;
		axios.defaults.headers.post['Content-Type'] = 'application/json';
		// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
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
		return axios.get(localPath)
		.then((team) => { return team.data.team; })
		.catch(this._handleError.bind(this));
	}

	public async teams(): Promise<[any]> {
		let teams = await this._teamsRequest();
		return teams;
	}

	private _teamsRequest(): Promise<[any]> {
		let localPath = 'team';
		return axios.get(localPath)
		.then((teams) => { return teams.data.teams; })
		.catch(this._handleError.bind(this));
	}

	public async authorize(auth: IAuthData): Promise<any> {
		let token = await this._authorize(auth);
		this.config.token = token;
		axios.defaults.headers.common['Authorization'] = this.config.token;
	}

	private _authorize(auth: IAuthData) {
		let localPath = 'oauth/token';
		return axios.post(localPath)
			.then((data) => { return data.data.access_token; })
			.catch(this._handleError.bind(this));
	}

	private _userRequest(token?: string): Promise<any> {
		let localPath = 'user';
		return axios.get(localPath)
		.then((userContainer) => { return userContainer.data; })
		.catch(this._handleError.bind(this));
	}

	public async user(): Promise<ICUser> {
		let userContainer = await this._userRequest();
		return userContainer.user;
	}

	public async batchUpdateTasks(tasks): Promise<any> {
		let updated = await this._batchUpdateTasks(tasks);
		return updated;
	}

	private _batchUpdateTasks(tasks): Promise<any> {
		let toUpdate: Array<Promise<any>> = [];

		tasks.forEach((task) => { toUpdate.push(this._updateTask(task)); });

		return axios.all(toUpdate).then(data => {
			return data;
		}).catch(this._handleError.bind(this));
	}

	private _updateTask(task): Promise<any> {
		if(!(task && task.id)) {
			console.error('No Task Id given for update');
			return;
		}
		let localPath = `/task/${task.id}`;
		return axios.put(localPath, task)
			.then((u) => { return u.data })
			.catch(this._handleError.bind(this))
	}

	private _batchCreateTasks(tasks): Promise<any> {

		let toCreate: Array<Promise<any>> = [];

		tasks.forEach((task) => { toCreate.push(this._createTask(task)); });

		return axios.all(toCreate).then((data) => {
			return data;
		}).catch(this._handleError.bind(this));
	}

	public async batchCreateTasks(tasks): Promise<any> {
		let newTasks = await this._batchCreateTasks(tasks);
		return newTasks;
	}

	private _createTask(task): Promise<any> {
		let localPath = `/list/${task.list_id.toString()}/task`;
		return axios.post(localPath, task)
			.then((taskId) => { return taskId.data; })
			.catch(this._handleError.bind(this));
	}

	public async createTask(task): Promise<void|any> {
		let createdTask = await this._createTask(task);
		return createdTask;
	}

	// api doesn't support uploading from token yet
	private _uploadAttachment(image): Promise<any> {
		return new Promise((resolve, reject) => {
			console.log('fake uploading attachment...')
			resolve('1234');
		});
	}

	public async uploadAttachment(image): Promise<void|any> {
		let uploadId = this._uploadAttachment(image);
		return uploadId;
	}

  private _handleError(err) {
    if(err['err'] && err['ECODE']) { 
      console.warn(`protractor-clickup api error: ${err['ECODE']}: ${err['err']}`);
    }
  }
}
