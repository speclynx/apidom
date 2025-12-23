import React from 'react';
import MUIAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import speclynxLogo from '../../../public/assets/images/speclynx-logo.svg';

const StyledMUIAppBar = styled(MUIAppBar)(({ theme }) => {
  return {
    zIndex: theme.zIndex.drawer + 1,
  };
});

const Logo = styled('img')({
  height: '40px',
  marginRight: '16px',
});

const AppBar = () => {
  return (
    <StyledMUIAppBar position="sticky">
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Logo src={speclynxLogo} alt="SpecLynx Logo" />
          <Typography variant="h6">ApiDOM Playground</Typography>
        </Box>
      </Toolbar>
    </StyledMUIAppBar>
  );
};

export default AppBar;
