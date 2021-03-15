import React, { useState } from 'react';
// Material UI components
import { makeStyles } from "@material-ui/core/styles";
import { Container, Paper, Box, Typography, Grid, Button } from '@material-ui/core';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
// hook from library
import { useAsync } from "react-async";
// custom components
import PlayersList from './PlayersList';
import RoomSettings from './RoomSettings';
import LoadingDisplay from './LoadingDisplay';
// assets
import MyBackgroundImg from '../../images/background.png';
import AnimatedLogoImg from '../../images/logo.gif';

// You can use async/await or any function that returns a Promise
const loadPlayer = async ({ playerId }, { signal }) => {
  const res = await fetch(`https://jsonplaceholder.typicode.com/todos/${playerId}`, { signal })
  if (!res.ok) throw new Error(res.statusText)
  return res.json()
}

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const useStyles = makeStyles((theme) => ({
  root: {
    textAlign: 'center',
    paddingTop: theme.spacing(5),
    paddingLeft: theme.spacing(10),
    paddingRight: theme.spacing(10),
    backgroundImage: `url(${MyBackgroundImg})`,
    minHeight: '100vh',
    color: "white",
  },
  content: {
    display: 'flex',
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
  },
  roomLinkText: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2)
  }
}));

export default function CreateRoom() {
  const classes = useStyles();
  const [isShowingLink, setIsShowingLink] = useState(false);
  const { data, error, isPending } = useAsync({ promiseFn: loadPlayer, playerId: 2 });

  // temp constant - should retrieve this from server
  const roomID = 'abc123';

  const [open, setOpen] = useState(false);
  const roomURL = process.env.REACT_APP_NODE_ENV === "production" ? "https://" + process.env.REACT_APP_API_URL + `/game/${roomID}` : `http://127.0.0.1:3000/game/${roomID}`;

  const handleClick = () => {
    // https://stackoverflow.com/questions/11401897/get-the-current-domain-name-with-javascript-not-the-path-etc
    navigator.clipboard.writeText(roomURL);
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  if (isPending) return <LoadingDisplay />
  if (error) return `Something went wrong: ${error.message}`
  if (data)
    return (
      <div className={classes.root}>
        <Container maxWidth="lg">
          <img src={AnimatedLogoImg} className={classes.logo} alt="animated logo" />
          <Grid container>
            <Grid item xs={2}>
            </Grid>
            <Grid item xs={4}>
              <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                <Typography variant="h4" gutterBottom>Settings</Typography>
                <RoomSettings roomURL={`/game/${roomID}`} hostUser={"James"} />
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                <Typography variant="h4" gutterBottom>Players</Typography>
                <PlayersList />
              </Box>
            </Grid>
            <Grid item xs={2}>
            </Grid>
          </Grid>
          <br />
          <div>
            <Typography variant="h4" gutterBottom>Invite your friends!</Typography>
            <Grid container
              onMouseEnter={() => setIsShowingLink(true)}
              onMouseLeave={() => setIsShowingLink(false)}
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Grid item xs={10}>
                <Paper>
                  <Typography variant="body1" className={classes.roomLinkText}>
                    {
                      isShowingLink
                        ? JSON.stringify(roomURL, null, 2)
                        : "Hover over me to see the invite link"
                    }
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={2}>
                <Button color="primary" variant="contained" style={{ width: "95%" }} onClick={handleClick}>Copy</Button>
              </Grid>
            </Grid>
          </div>
        </Container>
        <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
          <Alert onClose={handleClose} severity="success">
            URL copied to clipboard!
            <br />
            {roomURL}
          </Alert>
        </Snackbar>
      </div>
    )
  return null
}