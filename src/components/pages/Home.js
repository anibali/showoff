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
    //       requires a boolean flag in the store or something)
    // TODO: Make a single request (just include tags with notebooks)
    this.props.loadNotebooksShallow();
    this.props.loadTagsShallow();
  }

  render() {
    const tags = _.values(this.props.tags)
      .map(entity => _.assign({}, entity.attributes, _.pick(entity, ['id', 'relationships'])));

    // FIXME: Since this code creates new objects for each notebook, a change
    //        to _one_ will cause _all_ to rerender
    const unsortedNotebooks = _.values(this.props.notebooks)
      .map(entity => _.assign({}, entity.attributes, { id: entity.id }))
      .map(notebook => {
        const notebookTags =
          _.filter(tags, tag => tag.relationships.notebook.data.id === notebook.id);
        return _.assign({ tags: notebookTags }, notebook);
      });
    const filteredNotebooks = _.filter(unsortedNotebooks, notebook => {
      let show = true;
      this.state.filterTags.forEach(tag => {
        if(!_.find(notebook.tags, { name: tag.name })) {
          show = false;
        }
      });
      return show;
    });
    const notebooks = _.reverse(_.sortBy(filteredNotebooks, 'createdAt'));

    const tagOptions = _.uniqBy(tags, 'name');

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


export default ReactRedux.connect(
  (state) => ({
    tags: state.entities.tags,
    notebooks: state.entities.notebooks,
  }),
  (dispatch) => ({
    loadNotebooksShallow: _.flow(notebookActionCreators.loadNotebooksShallow, dispatch),
    loadTagsShallow: _.flow(tagActionCreators.loadTagsShallow, dispatch),
    deleteNotebook: _.flow(notebookActionCreators.deleteNotebook, dispatch),
    updateNotebook: _.flow(notebookActionCreators.updateNotebook, dispatch)
  })
)(Home);
