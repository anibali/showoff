import React from 'react';
import { Link } from 'react-router-dom';
import { withStyles } from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import AppBar from 'material-ui/AppBar';
import Button from 'material-ui/Button';


const styles = (theme) => ({
  hero: {
    color: theme.palette.common.darkWhite,
    height: 400,
    margin: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'none',
  },
  getStartedButton: {
    color: theme.palette.common.darkBlack,
  },
  heroButtonContainer: {
    textAlign: 'center',
    paddingTop: theme.spacing.unit * 4,
  },
  contentParagraph: {
    paddingTop: theme.spacing.unit * 2,
  },
});

const Home = ({ classes }) => (
  <div>
    <AppBar className={classes.hero} position="static">
      <div className="container">
        <Typography type="display4" color="inherit" align="center">
          Showoff
        </Typography>
        <Typography type="display1" color="inherit" align="center">
          More than stdout.
        </Typography>
        <div className={classes.heroButtonContainer}>
          <Button
            className={classes.getStartedButton}
            raised
            color="contrast"
            to="/notebooks"
            component={Link}
          >
            Get started
          </Button>
        </div>
      </div>
    </AppBar>
    <div className="container">
      <div className={classes.contentParagraph}>
        <Typography type="title">
          This instance of Showoff is only available as a private service, which
          means that you cannot sign up for an account.
        </Typography>
      </div>
    </div>
  </div>
);


export default withStyles(styles)(Home);
