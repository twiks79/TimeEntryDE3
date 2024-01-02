// components/CategorySection.js

import React from 'react';
import { Grid, Typography } from '@mui/material';
import InfoCard from './InfoCard';

export default function CategorySection({ category, cards }) {
    return (
        <>
            <Typography variant="h6" component="h2" gutterBottom style={{ marginBottom: '16px' }}>
                {category}
            </Typography>
            <Grid container spacing={2} style={{ marginBottom: '16px' }}>
                {cards.map((card, index) => (
                    <Grid item key={index} xs={12} sm={6} md={4}>
                        <InfoCard {...card} />
                    </Grid>
                ))}
            </Grid>
        </>
    );
}