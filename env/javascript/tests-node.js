print = console.log;//doh expects a print method
require({
    baseUrl: 'javascript',
    packages:[
        {
            name: 'doh',
            lib: '',
            location: 'doh'
        },
        {
            name: 'ufojs',
            location: '../../lib',
            lib: ''
        },
        {
            name: 'tests',
            location: '../../tests',
            lib: ''
        }
    ]
},
['doh/runner'],
function(){
    var factories = doh;
    doh= {};
    factories.runnerFactory(doh);
    
    doh.debug = console.log.bind(console);
    doh.error = function(error){
        console.log(error.name, 'stack>\n', error.stack, '\n<stack')
    };
    
    // Override the doh._report method to make it quit with an
    // appropriate exit code in case of test failures.
    var oldReport = doh._report;
    doh._report = function(){
        oldReport.apply(doh, arguments);
        if(this._failureCount > 0 || this._errorCount > 0){
            process.exit(1);
        }
    }
    
    doh._testFinished = function(group, fixture, success){
        var elapsed = fixture.endTime-fixture.startTime;
        this.debug((success ? "PASSED" : "FAILED"), "test:", fixture.name, elapsed, 'ms');
    }
    //tell the loader about doh
    define('doh', [], doh);
    
    // the tests module loads all tests
    var module = 'tests'
        i=0;
    // if we wan't to run only a specific test, here is a commandline option
    // example from the convenience ./tests-node.sh script:
    // ./env$ ./tests-node.sh -m tests/tools/pens/TransformPen
    for(;i<process.argv.length;i++)
        if (process.argv[i] in {'-m':0, '--module':0}) {
            module = process.argv[i+1];
            console.log('Testing custom module: ', module, '\n')
            break;
        }
    //now load our tests and execute them when ready
    require([module], function(tests){doh.run();});
});
