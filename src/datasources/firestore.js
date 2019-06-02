// @flow

import { DataSource } from 'apollo-datasource';
import type { DataSourceConfig } from 'apollo-datasource';

type UserProps = {
  traccarId: string,
  traccarCred: string,
};

type Context = {};

class Firestore extends DataSource<Context> {
  constructor({ store }: Object) {
    super();
    this.store = store;
  }

  initialize(config: DataSourceConfig<Context>) {
    this.context = config.context;
  }

  async getUser(uid: string): Promise<Object> {
    const doc = await this.store
      .collection('users')
      .doc(uid)
      .get();
    return doc.data();
  }
  updateUser(uid: string, data: UserProps): Promise<Object> {
    return this.store
      .collection('users')
      .doc(uid)
      .set(data, { merge: true });
  }
}

export default Firestore;
