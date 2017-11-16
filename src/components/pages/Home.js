import React from 'react';
import * as ReactRedux from 'react-redux';
import _ from 'lodash';
import { Typeahead } from 'react-bootstrap-typeahead';
import { Link } from 'react-router-dom';

import NotebookListItem from '../NotebookListItem';
import notebookActionCreators from '../../redux/notebooksActionCreators';
import tagActionCreators from '../../redux/tagsActionCreators';

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = { filterTags: [] };
  }

  // Called during server-side rendering
  static preloadData(dispatch) {
    return Promise.all([
      notebookActionCreators.loadNotebooksShallow()(dispatch),
      tagActionCreators.loadTagsShallow()(dispatch),
    ]);
  }

  componentWillMount() {
    // TODO: Skip doing this if it has already been done (probably
    // requires a boolean flag in the store or something)
    this.props.loadNotebooksShallow();
    this.props.loadTagsShallow();
  }

  // Describe how to render the component
  render() {
    const onChange = (selectedItems) => {
      this.setState({ filterTags: selectedItems });
    };

    let notebooks = _.reverse(_.sortBy(this.props.notebooks, (notebook) => notebook.createdAt));
    notebooks = _.filter(notebooks, notebook => {
      let show = true;
      this.state.filterTags.forEach(tag => {
        if(!_.find(notebook.tags, { name: tag.name })) {
          show = false;
        }
      });
      return show;
    });

    const tagOptions = _.uniqBy(this.props.tags, 'name');

    const createListItem = (notebook) => (
      <NotebookListItem
        key={notebook.id}
        notebook={notebook}
        deleteNotebook={this.props.deleteNotebook}
        updateNotebook={this.props.updateNotebook}
        tagOptions={tagOptions}
      />
    );

    return (
      <div>
        <header className="header-bar">
          <div className="container">
            <div className="row">
              <Link to="/account">
                Account
              </Link>
            </div>
          </div>
        </header>
        <div className="container">
          <div className="row">
            <h1>Notebooks</h1>
            <Typeahead
              clearButton
              labelKey="name"
              multiple
              options={tagOptions}
              defaultSelected={this.state.filterTags}
              placeholder="Filter tags..."
              highlightOnlyResult
              onChange={onChange}
            />
            <div style={{ height: 8 }} />
            <div className="list-group">
              {notebooks.map(createListItem)}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const getNotebooksWithTags = ({ notebooks, tags }) =>
  notebooks.map(notebook => {
    const notebookTags = _.filter(tags, { notebookId: notebook.id });
    return _.assign({ tags: notebookTags }, notebook);
  });

export default ReactRedux.connect(
  // Map store state to props
  (state) => ({
    tags: state.tags,
    // FIXME: This creates new notebooks, so every item in the list always re-renders
    notebooks: getNotebooksWithTags(state),
  }),
  (dispatch) => ({
    loadNotebooksShallow: _.flow(notebookActionCreators.loadNotebooksShallow, dispatch),
    loadTagsShallow: _.flow(tagActionCreators.loadTagsShallow, dispatch),
    deleteNotebook: _.flow(notebookActionCreators.deleteNotebook, dispatch),
    updateNotebook: _.flow(notebookActionCreators.updateNotebook, dispatch)
  })
)(Home);
