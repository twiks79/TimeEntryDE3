import React from 'react';
import { Card, CardActionArea, CardContent, Typography, Box, useTheme, useMediaQuery } from '@mui/material';

function InfoCard({ icon, title, additionalText, link }) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // Customize the icon size based on the screen size
  const iconSize = isSmallScreen ? 'small' : 'large'; // Or use specific values like '48px'

  // Clone the icon element with new props
  const adjustedIcon = React.cloneElement(icon, { fontSize: iconSize, color: 'primary'});

  return (
    <Card sx={{ width: '80%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea onClick={() => { window.location.href = link; }} sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 2 }}>
          {adjustedIcon}
          <CardContent sx={{ textAlign: 'center', alignContent: 'center', justifyContent: 'center'}}>
            <Typography gutterBottom variant="body1" component="div">
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {additionalText}
            </Typography>
          </CardContent>
        </Box>
      </CardActionArea>
    </Card>
  );
}

export default InfoCard;
