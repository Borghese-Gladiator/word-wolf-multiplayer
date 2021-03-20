import React, { useState, useEffect } from 'react'
// routing - get roomID from URL
// import { useParams } from 'react-router-dom';

// SocketIO Client
import socketIOClient from "socket.io-client";
// Generate usernames
import userGen from "username-generator"
// Material UI Components
import { makeStyles } from "@material-ui/core/styles";
import {
  Box, Grid, Paper, Button, Typography, Container
} from '@material-ui/core';
// custom components
import LoadingDisplay from '../LoadingDisplay';
import GamePlayersList from './GamePlayersList';
import PhaseDisplay from './PhaseDisplay';
import GameChat from './GameChat';

// client-side
const ENDPOINT = process.env.REACT_APP_NODE_ENV === "production" ? process.env.REACT_APP_API_URL : "http://127.0.0.1:4001";
const socket = socketIOClient(ENDPOINT, {
  withCredentials: true,
  extraHeaders: {
    "my-custom-header": "abcd"
  }
});

function UserWordDisplay({ word }) {
  return (
    <Paper>
      <Typography variant="h6">Your word</Typography>
      <Typography variant="h3">{word}</Typography>
    </Paper>
  )
}

const useStyles = makeStyles((theme) => ({
  root: {
    textAlign: 'center',
  }
}))


function Game() {
  const classes = useStyles();
  // get Room ID from URL
  // let { roomID } = useParams();

  // const [word, setWord] = useState("MIT");
  const word = "MIT"
  // SocketIO Room (users present)
  const [loggedUser, setLoggedUser] = useState(
    { id: "1", userName: "Player 1" }
  );
  const [userList, setUserList] = useState([
    { id: "1", userName: "Player 1" },
    { id: "2", userName: "Player 1" },
    { id: "3", userName: "Player 1" },
    { id: "4", userName: "Player 1" },
    { id: "5", userName: "Player 1" },
  ]);
  // SocketIO Chat
  // NOTE: these IDs are the IDs of the user who sent the message
  const [msgList, setRecMsg] = useState([
    { id: "blah", userName: "Player 1", msg: "Message", time: "21:29" },
    { id: "blah", userName: "Player 1", msg: "Message", time: "21:29" },
    { id: "blah", userName: "Player 1", msg: "Message", time: "21:29" },
  ]);

  useEffect(() => {
    socket.on('message', function (data) {
      console.log('Incoming message:', data);
    });

    // subscribe a new user
    socket.emit("login", userGen.generateUsername());
    // list of connected users
    socket.on("users", data => {
      setUserList(JSON.parse(data))
    });
    // get the logged user
    socket.on("connecteduser", data => {
      setLoggedUser(JSON.parse(data));
    });

    // we get the messages
    socket.on("getMsg", data => {
      const listMessages = msgList;
      listMessages.push(JSON.parse(data));
      setRecMsg(listMessages);
    });
  }, [msgList]);

  // to send a message
  const sendMessage = (msg) => {
    socket.emit("sendMsg", JSON.stringify({ id: loggedUser.id, msg: msg }));
  }

  if (!socket.connected) {
    return <LoadingDisplay />
  } else {
    return (
      <Container className={classes.root}>
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center">
          <Button variant="contained" color="primary" onClick={() => alert("PAUSED")}>PAUSE TIMER</Button>
          <Typography variant="h5">You are: {loggedUser?.userName}</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <GamePlayersList userList={userList} />
              <br />
              <UserWordDisplay word={word} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <PhaseDisplay />
              <br />
              <GameChat loggedUserID={loggedUser.id} msgList={msgList} sendMessage={sendMessage} />
            </Grid>
          </Grid>
        </Box>
      </Container>
    );
  }
}

export default Game;