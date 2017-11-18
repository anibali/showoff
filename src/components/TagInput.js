import React from 'react';
import _ from 'lodash';
import ReactTags from 'react-tag-autocomplete';


class TagInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = { tags: props.initialTags || [] };

    const setTags = (tags) => {
      this.setState({ tags }, () => {
        if(this.props.onChange) {
          this.props.onChange(this.state.tags);
        }
      });
    };
    this.addFilterTag = (newTag) => {
      if(_.find(this.state.tags, { name: newTag.name })) {
        return;
      }
      setTags([].concat(this.state.tags, newTag));
    };
    this.removeFilterTag = (removeIndex) => {
      setTags(_.reject(this.state.tags, (tag, i) => i === removeIndex));
    };
  }

  render() {
    return (
      <ReactTags
        tags={this.state.tags}
        suggestions={this.props.suggestions}
        handleDelete={this.removeFilterTag}
        handleAddition={this.addFilterTag}
        minQueryLength={1}
        allowNew={this.props.allowNew}
        placeholder={this.props.placeholder}
        autofocus={false}
      />
    );
  }
}


export default TagInput;
