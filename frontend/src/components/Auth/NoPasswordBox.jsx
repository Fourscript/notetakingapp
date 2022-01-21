import { Avatar, Box, Button, Grid, Link, TextField } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";

export default function NoPasswordBox(props) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Grid container justifyContent="center" alignItems="center">
        <Avatar sx={{ bgcolor: "primary.main" }}>
          <LockIcon />
        </Avatar>
      </Grid>
      <Box
        component="form"
        noValidate
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          alignItems: "center",
        }}
      >
        <TextField
          margin="normal"
          sx={{ borderRadius: 100 }}
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          onChange={(event) => props.setEmail(event.target.value)}
          defaultValue={props.email}
          autoFocus
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color={"primary"}
          disabled={props.email === ""}
          sx={{ mt: 3, mb: 3 }}
        >
          Send Confirmation Code
        </Button>
        <Link
          href="javascript:void (0)"
          variant="body2"
          onClick={() => {
            props.setCurrentBox("register");
          }}
        >
          {"Don't have an account? Create one!"}
        </Link>
      </Box>
    </Box>
  );
}