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
import { getFilteredNotebooks } from '../../redux/selectors/notebookSelectors';
import { getTagNames } from '../../redux/selectors/tagSelectors';


const createListItem = (notebook) => (
  <NotebookListItem
    key={notebook.id}
    notebookId={notebook.id}
  />
);

const NotebookListContent = ({ notebooks }) => {
  const sortedNotebooks = _.reverse(
    _.sortBy(notebooks, notebook => notebook.attributes.createdAt));

  return (
    <Paper>
      <List>
        {sortedNotebooks.map(createListItem)}
      </List>
    </Paper>
  );
};

const ConnectedNotebookListContent = ReactRedux.connect(
  (state, ownProps) => ({
    notebooks: getFilteredNotebooks(state, ownProps.tagNames),
  })
)(NotebookListContent);

class NotebookList extends React.Component {
  constructor(props) {
    super(props);
    this.state = { tagNames: [] };

    this.onChangeFilterTags = (tags) => {
      this.setState({ tagNames: tags.map(tag => tag.name) });
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
          <ConnectedNotebookListContent tagNames={this.state.tagNames} />
        </div>
      </div>
    );
  }
}


export default ReactRedux.connect(
  (state) => ({
    tagOptions: getTagNames(state),
  }),
  (dispatch) => ({
    loadNotebooksWithTags: _.flow(complexActionCreators.loadNotebooksWithTags, dispatch),
  })
)(NotebookList);
