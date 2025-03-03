import React from 'react';
import { withStyles } from '@ellucian/react-design-system/core/styles';
import { Button } from '@ellucian/react-design-system/core';
import PropTypes from 'prop-types';

const styles = () => ({
    card: {
        marginTop: '20px',
        padding: '20px',
        backgroundColor: '#F4F4F4',
        borderRadius: '8px'
    }
});

const AsyncreportCard = (props) => {
    console.log("props" ,props)
    const { classes, cardControl: { navigateToPage } } = props;

  
    const handleNavigation = () => {
        console.log("Navigating");
        navigateToPage({ route: "/async" }); 
    };

    return (
        <div className={classes.card}>
            <Button color="primary" size="large" variant="contained" onClick={handleNavigation}>
                Async Reports
            </Button>
        </div>
    );
};

AsyncreportCard.propTypes = {
    classes: PropTypes.object.isRequired,
    cardControl: PropTypes.object.isRequired
};

export default withStyles(styles)(AsyncreportCard);
