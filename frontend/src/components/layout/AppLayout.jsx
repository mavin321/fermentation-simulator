import React from "react";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Container
} from "@mui/material";

function AppLayout({ children }) {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Fermentation Simulator
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Virtual Fermenter · Demo
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ py: 2 }}>
        {children}
      </Container>
    </Box>
  );
}

export default AppLayout;
