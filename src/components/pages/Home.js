import React from 'react';
import * as ReactRedux from 'react-redux';
import _ from 'lodash';
import List from 'material-ui/List';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';

import NotebookListItem from '../NotebookListItem';
import TagInput from '../TagInput';
import Header from '../Header';
import notebookActionCreators from '../../redux/notebooksActionCreators';
import tagActionCreators from '../../redux/tagsActionCreators';


class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = { filterTags: [] };

    this.onChangeFilterTags = (filterTags) => {
      this.setState({ filterTags });
    };
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

  render() {
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
        <Header />
        <div className="container">
          <Typography type="headline" gutterBottom>
            Notebooks
          </Typography>
          <TagInput
            suggestions={tagOptions}
            onChange={this.onChangeFilterTags}
            placeholder="Add filter tag"
          />
          <Paper>
            <List>
              {notebooks.map(createListItem)}
            </List>
          </Paper>
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
