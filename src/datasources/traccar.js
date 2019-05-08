import { AuthenticationError } from 'apollo-server';
import { RESTDataSource } from 'apollo-datasource-rest';
import { pick, head } from 'lodash';

import { createCookie } from '../auth';

function userReducer(user) {
  return pick(user, ['id', 'email', 'name']);
}

function deviceReducer(device) {
  return Object.assign(
    { status: device.status.toUpperCase() },
    pick(device, ['id', 'uniqueId', 'name'])
  );
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
        return { body: null, headers };
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
    if (!body) {
      throw new AuthenticationError('Invalid credentials');
    }
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
    if (!body) {
      throw new AuthenticationError('Invalid credentials');
    }
    return Object.assign({ cookie: headers.get('set-cookie') }, userReducer(body));
  }

  async deleteSession() {
    await this.delete('session');
    return null;
  }

  async getDevices() {
    const { body } = await this.get('devices');
    return body.map(deviceReducer);
  }

  async getDeviceById(id) {
    if (!id) {
      return null;
    }
    const { body } = await this.get('devices', { id });
    return deviceReducer(head(body));
  }

  async getDevicesByUserId(userId) {
    if (!userId) {
      return [];
    }
    const { body } = await this.get('devices', { userId });
    return body.map(deviceReducer);
  }
}

export default TraccarAPI;
