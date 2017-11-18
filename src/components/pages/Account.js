import React from 'react';
import * as ReactRedux from 'react-redux';
import _ from 'lodash';
import Button from 'material-ui/Button';
import Typography from 'material-ui/Typography';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';
import IconButton from 'material-ui/IconButton';
import DeleteForeverIcon from 'material-ui-icons/DeleteForever';
import ContentCopyIcon from 'material-ui-icons/ContentCopy';
import TextField from 'material-ui/TextField';
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


const createApiKeyItem = apiKey => (
  <TableRow key={apiKey.id}>
    <TableCell>{apiKey.id}</TableCell>
    <TableCell>{new Date(apiKey.createdAt).toUTCString()}</TableCell>
    <TableCell>
      {/* TODO: Implement per-key deletion */}
      <IconButton title="Delete this API key">
        <DeleteForeverIcon />
      </IconButton>
    </TableCell>
  </TableRow>
);

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
  }

  componentWillMount() {
    if(process.env.IN_BROWSER) {
      this.props.loadCurrentUserApiKeys();
    }
  }

  render() {
    return (
      <div>
        <Header />
        <div className="container">
          <div className="row">
            <Typography type="headline" gutterBottom>
              User account
            </Typography>
            <Typography type="subheading" gutterBottom>
              API keys
            </Typography>
            <div className="btn-toolbar" style={{ marginBottom: 12 }}>
              <Button raised onClick={this.addKey}>Add new key</Button>
              <Button raised onClick={this.destroyKeys}>Destroy all keys</Button>
            </div>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>API key ID</TableCell>
                  <TableCell>Creation date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {this.props.user.apiKeys.map(createApiKeyItem)}
              </TableBody>
            </Table>
          </div>
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


export default ReactRedux.connect(
  (state) => ({
    user: state.auth.user,
  }),
  (dispatch) => ({
    loadCurrentUserApiKeys: _.flow(authActionCreators.loadCurrentUserApiKeys, dispatch),
    createCurrentUserApiKey: _.flow(authActionCreators.createCurrentUserApiKey, dispatch),
    destroyCurrentUserApiKeys: _.flow(authActionCreators.destroyCurrentUserApiKeys, dispatch),
  })
)(Account);
