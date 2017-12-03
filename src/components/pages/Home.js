import React from 'react';
import * as ReactRedux from 'react-redux';
import _ from 'lodash';
import List from 'material-ui/List';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';

import NotebookListItem from '../NotebookListItem';
import TagInput from '../TagInput';
import Header from '../Header';
import complexActionCreators from '../../redux/complexActionCreators';
import { getNotebooks } from '../../redux/selectors/notebookSelectors';
import { getTags, getTagNames } from '../../redux/selectors/tagSelectors';


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
      complexActionCreators.loadNotebooksWithTags()(dispatch),
    ]);
  }

  componentWillMount() {
    // TODO: Skip doing this if it has already been done (probably
    //       requires a boolean flag in the store or something)
    this.props.loadNotebooksWithTags();
  }

  render() {
    const tags = _.values(this.props.tags)
      .map(entity => _.assign({}, entity.attributes, _.pick(entity, ['id', 'relationships'])));

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

    const createListItem = (notebook) => (
      <NotebookListItem
        key={notebook.id}
        notebookId={notebook.id}
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
            suggestions={this.props.tagOptions}
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
    tags: getTags(state),
    tagOptions: getTagNames(state),
    notebooks: getNotebooks(state),
  }),
  (dispatch) => ({
    loadNotebooksWithTags: _.flow(complexActionCreators.loadNotebooksWithTags, dispatch),
  })
)(Home);
