const React = require('react');
const ReactRedux = require('react-redux');
const _ = require('lodash');
const { Typeahead } = require('react-bootstrap-typeahead');

const NotebookListItem = require('./NotebookListItem');

const notebookActionCreators = require('../reducers/notebooks');
const tagActionCreators = require('../reducers/tags');
const reactAsync = require('../helpers/reactAsync');

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = { filterTags: [] };
  }

  componentWillMount() {
    // TODO: Skip doing this if it has already been done (probably
    // requires a boolean flag in the store or something)
    reactAsync.addPromise(this.props.loadNotebooksShallow());
    reactAsync.addPromise(this.props.loadTagsShallow());
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

    const createListItem = (notebook) =>
      <NotebookListItem
        key={notebook.id}
        notebook={notebook}
        deleteNotebook={this.props.deleteNotebook}
        updateNotebook={this.props.updateNotebook}
        tagOptions={tagOptions}
      />;

    return (
      <div className="container">
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
        <div className="list-group">
          {notebooks.map(createListItem)}
        </div>
      </div>
    );
  }
}

const getNotebooksWithTags = (state) => {
  const tags = state.tags;
  const notebooks = state.notebooks.map(notebook => {
    const notebookTags = _.filter(tags, { notebookId: notebook.id });
    return _.assign({ tags: notebookTags }, notebook);
  });
  return notebooks;
};

module.exports = ReactRedux.connect(
  // Map store state to props
  (state) => ({
    tags: state.tags,
    notebooks: getNotebooksWithTags(state),
  }),
  (dispatch) => ({
    loadNotebooksShallow: _.flow(notebookActionCreators.loadNotebooksShallow, dispatch),
    loadTagsShallow: _.flow(tagActionCreators.loadTagsShallow, dispatch),
    deleteNotebook: _.flow(notebookActionCreators.deleteNotebook, dispatch),
    updateNotebook: _.flow(notebookActionCreators.updateNotebook, dispatch)
  })
)(Home);
