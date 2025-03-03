module.exports = {
    name: 'Asyncreport',
    publisher: 'Sample',
    group:'all-accounts',
    cards: [{
        type: 'AsyncreportCard',
        source: './src/cards/AsyncreportCard',
        title: 'Asyncreport Card',
        displayCardType: 'Asyncreport Card',
        description: 'This is an introductory card to the Ellucian Experience SDK',
        pageRoute: {
            route: '/',
            excludeClickSelectors: ['a']
        }
    }],
    page: {
        source: './src/page/router.jsx'
    }
};