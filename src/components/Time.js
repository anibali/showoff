import React from 'react';
import parse from 'date-fns/parse';
import format from 'date-fns/format';


class Time extends React.Component {
  constructor(props) {
    super(props);

    this.state = { dateTimeString: '\u00A0' };
  }

  componentDidMount() {
    this.setState({
      dateTimeString: format(parse(this.props.dateTime), 'ddd D MMM YYYY, h:mm aa')
    });
  }

  render() {
    const { dateTime } = this.props;
    return <time dateTime={dateTime}>{this.state.dateTimeString}</time>;
  }
}


export default Time;
