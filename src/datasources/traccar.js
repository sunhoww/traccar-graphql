// @flow

import { AuthenticationError, ApolloError } from 'apollo-server';
import { RESTDataSource } from 'apollo-datasource-rest';
import type { Request, Response } from 'apollo-server-env';
import { pick, head, kebabCase } from 'lodash';

import type { Context } from '../types';

class TraccarError extends ApolloError {}

type SessionArgs = {
  email: string,
  password: string,
};

type UserArgs = SessionArgs & {
  name: string,
};

function deviceReducer(device) {
  return Object.assign(
    { status: device.status.toUpperCase() },
    pick(device, ['id', 'uniqueId', 'name'])
  );
}

class TraccarAPI extends RESTDataSource<Context> {
  constructor() {
    super();
    this.baseURL = `${process.env.TRACCAR_BACKEND || ''}/api`;
  }

  async didReceiveResponse(response: Response, request: Request) {
    if (!response.ok) {
      const { url, status, statusText } = response;
      const code = `${status}/${kebabCase(statusText)}`;
      const msg = await response.text();
      throw new TraccarError(msg, code, {
        code,
        url: url.replace(new RegExp(this.baseURL, 'g'), ''),
        status,
        statusText,
      });
    }

    const { headers } = response;
    const { method, pathname } = request;
    const body = await super.didReceiveResponse(response, request);
    if (method === 'POST' && pathname === '/api/session') {
      return Object.assign(body, { traccarSessionId: headers.get('set-cookie') });
    }
    return body;
  }

  willSendRequest(request: Request) {
    const { traccarSid } = this.context;
    if (traccarSid) {
      request.headers.set('Cookie', traccarSid);
    }
  }

  getSession(): Promise<Object> {
    return this.get('session');
  }

  createSession({ email, password }: SessionArgs): Promise<Object> {
    return this.post('session', `email=${email}&password=${password}`, {
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
    });
  }

  createUser({ email, name, password }: UserArgs): Promise<Object> {
    return this.post('users', { email, name, password });
  }

  deleteSession(): Promise<null> {
    return this.delete('session');
  }

  async getDevices() {
    const { body } = await this.get('devices');
    return body.map(deviceReducer);
  }

  async getDeviceById(id: String) {
    if (!id) {
      return null;
    }
    const { body } = await this.get('devices', { id });
    return deviceReducer(head(body));
  }

  async getDevicesByUserId(userId: String) {
    if (!userId) {
      return [];
    }
    const { body } = await this.get('devices', { userId });
    return body.map(deviceReducer);
  }
}

export default TraccarAPI;
