// Material UI components
import { Paper, Box, Grid, Typography } from '@material-ui/core';
// Material UI icons
import AccountBoxIcon from '@material-ui/icons/AccountBox';

function GamePlayersList({ userList }) {
  return (
    <Paper>
      <Box p={1} display="flex" flexDirection="column" justifyContent="center" alignItems="center">
        <Grid container spacing={3}>
          {userList.map((val, idx) => {
            const { id, userName, connectionTime } = val;
            console.log(`Connection Time: ${connectionTime}`)
            return (
              <Grid item xs={12} key={`${id} ${idx}`}>
                <AccountBoxIcon style={{ fontSize: "40px" }} />
                <Typography variant="h6" style={{ wordWrap: 'break-word' }}>{userName}</Typography>
              </Grid>
            )
          })}
        </Grid>
      </Box>
    </Paper>

  )
}

export default GamePlayersList;