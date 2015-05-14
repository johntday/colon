Package.describe({
    name: 'johntday:colon',
    version: '0.3.2',
    summary: 'Constraint-Based Layout for d3',
    git: 'https://github.com/johntday/colon',
    documentation: 'README.md'
});

Package.onUse(function (api) {
    api.versionsFrom('1.0.5');

    // meteor dependencies
    api.use('d3js:d3@3.5.5');

    api.addFiles('utils.js');
    api.addFiles('colon.js');
    api.addFiles('flatgraph.js');
    //api.addFiles('powergraph.js');
    api.addFiles('graphlib-dot.min.js');
    api.addFiles('dotpowergraph.js');

    // symbol exports
    api.export('cola');
    api.export('FlatGraph');
    //api.export('PowerGraph');
    api.export('DotPowerGraph');
});

Package.onTest(function (api) {
    api.use('tinytest');
    api.use('johntday:colon');
    api.addFiles('colon-tests.js');
});
