angular.module('apiModule')
    .constant('ApiUrlConstants', {
        nteProd: 'https://www.nexttier.com/apply',
        nteStaging: 'https://stg.nexttier.com/apply',
        applyLocalDocker: 'http://apply.localdocker.com',
        environmentRoot: 'https://next-tier.s3.amazonaws.com/',
        localApi: 'http://localdocker/v1',
        stagingApi: 'https://api-staging.nexttier.com/v1',
        prodApi: 'https://api.nexttier.com/v1',
        demoApi: 'https://api-demo.nexttier.com/v1'
    });
