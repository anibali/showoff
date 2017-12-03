import expect from 'must';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import MockAdapter from 'axios-mock-adapter';

import apiClient from '../../src/helpers/apiClient';
import complexActionCreators from '../../src/redux/complexActionCreators';


const mockStore = configureStore([thunk]);

describe('complexActionCreators', () => {
  let axiosMock;
  before(() => {
    axiosMock = new MockAdapter(apiClient.client);
    axiosMock.onGet('/notebooks?include=tags').reply(200, {
      data: [],
    });
  });

  after(() => {
    axiosMock.restore();
  });

  describe('loadNotebooksWithTags', () => {
    it('should dispatch an "entities/MERGE_ENTITIES" action', () => {
      const store = mockStore({});
      return store.dispatch(complexActionCreators.loadNotebooksWithTags()).then(() => {
        expect(store.getActions()).to.eql([
          { type: 'entities/MERGE_ENTITIES', payload: { normalizedData: {} } }
        ]);
      });
    });
  });
});
