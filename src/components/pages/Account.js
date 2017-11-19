import React from 'react';
import * as ReactRedux from 'react-redux';
import _ from 'lodash';
import { withStyles } from 'material-ui/styles';
import Button from 'material-ui/Button';
import Typography from 'material-ui/Typography';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';
import IconButton from 'material-ui/IconButton';
import DeleteForeverIcon from 'material-ui-icons/DeleteForever';
import ContentCopyIcon from 'material-ui-icons/ContentCopy';
import AddIcon from 'material-ui-icons/Add';
import { FormControl } from 'material-ui/Form';
import Input, { InputAdornment, InputLabel } from 'material-ui/Input';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog';

import Header from '../Header';
import authActionCreators from '../../redux/authActionCreators';


const styles = theme => ({
  button: {
    margin: theme.spacing.unit * 2,
  },
  rightIcon: {
    marginLeft: theme.spacing.unit,
  },
});

class CopyField extends React.Component {
  constructor(props) {
    super(props);
    this.setInputRef = (ref) => { this.inputRef = ref; };
    this.selectAll = () => {
      this.inputRef.select();
    };
    this.copyToClipboard = () => {
      this.selectAll();
      document.execCommand('copy');
    };
  }

  render() {
    const { id, label, value } = this.props;
    let endAdornment = null;
    if(document.queryCommandSupported('copy')) {
      endAdornment = (
        <InputAdornment position="end">
          <IconButton onClick={this.copyToClipboard}>
            <ContentCopyIcon />
          </IconButton>
        </InputAdornment>
      );
    }
    return (
      <FormControl fullWidth margin="normal">
        <InputLabel htmlFor={id}>{label}</InputLabel>
        <Input
          id={id}
          inputRef={this.setInputRef}
          value={value}
          onFocus={this.selectAll}
          endAdornment={endAdornment}
        />
      </FormControl>
    );
  }
}

class ApiKeyTableRow extends React.Component {
  constructor(props) {
    super(props);
    this.fireOnDelete = () => {
      this.props.onDelete(this.props.apiKey.id);
    };
  }
  render() {
    const { apiKey } = this.props;
    return (
      <TableRow key={apiKey.id}>
        <TableCell>{apiKey.id}</TableCell>
        <TableCell>{new Date(apiKey.createdAt).toUTCString()}</TableCell>
        <TableCell>
          <IconButton title="Delete this API key" onClick={this.fireOnDelete}>
            <DeleteForeverIcon />
          </IconButton>
        </TableCell>
      </TableRow>
    );
  }
}

class Account extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      keyCreatedDialogOpen: false,
      newApiKey: { id: '', secretKey: '' }
    };
    this.addKey = (event) => {
      event.preventDefault();
      this.props.createCurrentUserApiKey()
        .then((apiKey) => {
          this.setState({
            keyCreatedDialogOpen: true,
            newApiKey: apiKey.data,
          });
        });
    };
    this.destroyKeys = (event) => {
      event.preventDefault();
      this.props.destroyCurrentUserApiKeys();
    };
    this.hideKeyCreatedDialog = () => {
      this.setState({
        keyCreatedDialogOpen: false,
      });
    };
    this.createApiKeyTableRow = apiKey =>
      <ApiKeyTableRow apiKey={apiKey} onDelete={this.props.destroyApiKey} />;
  }

  componentWillMount() {
    if(process.env.IN_BROWSER) {
      this.props.loadCurrentUserApiKeys();
    }
  }

  render() {
    const { classes } = this.props;

    return (
      <div>
        <Header />
        <div className="container">
          <Typography type="headline" gutterBottom>
            User account
          </Typography>
          <Typography type="subheading" gutterBottom>
            API keys
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>API key ID</TableCell>
                <TableCell>Creation date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.props.user.apiKeys.map(this.createApiKeyTableRow)}
            </TableBody>
          </Table>
          <Button className={classes.button} raised color="primary" onClick={this.addKey}>
            Add new key
            <AddIcon className={classes.rightIcon} />
          </Button>
        </div>
        <Dialog open={this.state.keyCreatedDialogOpen}>
          <DialogTitle>API key created</DialogTitle>
          <DialogContent>
            <DialogContentText>
              This is the one and only time that we are going to show you the
              secret part of this API key. If you lose it, you will need
              to create a new key.
            </DialogContentText>
            <CopyField
              id="keyIdField"
              label="API key ID"
              value={this.state.newApiKey.id}
            />
            <CopyField
              id="secretKeyField"
              label="Secret key"
              value={this.state.newApiKey.secretKey}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.hideKeyCreatedDialog} color="primary" autoFocus>
              I have copied the secret key
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}


export default withStyles(styles)(ReactRedux.connect(
  (state) => ({
    user: state.auth.user,
  }),
  (dispatch) => ({
    loadCurrentUserApiKeys: _.flow(authActionCreators.loadCurrentUserApiKeys, dispatch),
    createCurrentUserApiKey: _.flow(authActionCreators.createCurrentUserApiKey, dispatch),
    destroyCurrentUserApiKeys: _.flow(authActionCreators.destroyCurrentUserApiKeys, dispatch),
    destroyApiKey: _.flow(authActionCreators.destroyApiKey, dispatch),
  })
)(Account));
