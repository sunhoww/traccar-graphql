import { AuthenticationError } from 'apollo-server';
import { RESTDataSource } from 'apollo-datasource-rest';
import { pick } from 'lodash';

import { createCookie } from '../auth';

function userReducer(user) {
  return pick(user, ['id', 'email', 'name']);
}

class TraccarAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = process.env.TRACCAR_BACKEND + '/api';
  }

  async didReceiveResponse(response, request) {
    const { headers } = response;
    try {
      const body = await super.didReceiveResponse(response, request);
      return { body, headers };
    } catch (e) {
      if (e.name === 'FetchError' && e.type === 'invalid-json') {
        throw new AuthenticationError('Invalid credentials');
      }
      throw e;
    }
  }

  willSendRequest(request) {
    const { sid } = this.context.claims;
    if (sid) {
      request.headers.set('Cookie', createCookie(sid));
    }
  }

  async getSession() {
    const { body } = await this.get('session');
    return userReducer(body);
  }

  async createSession({ email, password }) {
    const { body, headers } = await this.post(
      'session',
      `email=${email}&password=${password}`,
      {
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
      }
    );
    return Object.assign({ cookie: headers.get('set-cookie') }, userReducer(body));
  }

  async deleteSession() {
    await this.delete('session');
    return null;
  }
}

export default TraccarAPI;
