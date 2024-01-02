// components/InfoCard.js

import React from 'react';
import { Card, CardActionArea, CardContent, Typography, Box } from '@mui/material';

function InfoCard({ icon, title, additionalText, link }) {
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardActionArea onClick={() => { window.location.href = link; }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 2 }}>
          <Box sx={{ fontSize: 60, color: 'primary.main' }}>{icon}</Box>
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
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