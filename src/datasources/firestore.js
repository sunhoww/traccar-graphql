// @flow

import { DataSource } from 'apollo-datasource';

type UserProps = {
  traccarId: string,
  traccarCred: string,
};

class Firestore extends DataSource {
  constructor({ store }: Object) {
    super();
    this.store = store;
  }

  initialize(config: Object) {
    this.context = config.context;
  }

  async getUser(uid: string) {
    const doc = await this.store
      .collection('users')
      .doc(uid)
      .get();
    return doc.data();
  }
  updateUser(uid: string, data: UserProps) {
    return this.store
      .collection('users')
      .doc(uid)
      .set(data, { merge: true });
  }
}

export default Firestore;
