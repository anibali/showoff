import expect from 'must';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import tagsActionCreators from '../../src/redux/tagsActionCreators';


const mockStore = configureStore([thunk]);

describe('tagsActionCreators', () => {
  let axiosMock;
  before(() => {
    axiosMock = new MockAdapter(axios);
    axiosMock.onGet('http://localhost:3000/api/v2/tags').reply(200, {
      data: [],
    });
  });

  after(() => {
    axiosMock.restore();
  });

  describe('loadTagsShallow', () => {
    it('should dispatch a "tags/ADD_TAGS" action', () => {
      const store = mockStore({});
      return store.dispatch(tagsActionCreators.loadTagsShallow()).then(() => {
        expect(store.getActions()).to.eql([
          { type: 'tags/ADD_TAGS', payload: { tags: [] } }
        ]);
      });
    });
  });
});
