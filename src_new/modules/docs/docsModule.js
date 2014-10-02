
angular.module('docs', [
    'sharedElements',
    'docs.Controllers',
    'docs.Directives'
])
.provider('docs', [function(){
    var lookup = {};
    var otherwiseLookup = null;

    var ROUTER = {
        when: function(key, url, params) {
            lookup[key] = {
                url : url,
                params : params
            };
        },

        install: function($routeProvider) {
            for(var key in lookup) {
                var route = lookup[key];
                var url = route['url'];
                var params = route['params'];
                $routeProvider.when(url, params);
            }
            if(otherwiseLookup) {
                $routeProvider.otherwise(otherwiseLookup);
            }
        }
    };

    var config = window.CONFIG.docs;
    return {
        setApiHost: function(host){
            CONFIG.docs.baseEndpoint = host;
        },
        setApiNamespace: function(namespace){
            CONFIG.docs.apiNamespace = namespace;
        },
        html5Mode: function(use, prefix){
            CONFIG.docs.routing.html5Mode = !!use;
            CONFIG.docs.routing.urlPrefix = prefix || '';
        },
        enableNavbar: function(){
            CONFIG.docs.enableNavbar = true;
        },
        mountTo: function($routeProvider, mountPoint){

            ROUTER.when('docs_page', mountPoint + '/docs', {
                templateUrl : config.prepareViewTemplateUrl('docs', 'docs'),
                controller:'DocsCtrl as DocsCtrl',
                resolve: {
                    resources: ['$q', '$http', function($q, $http){
                        var d = $q.defer();
                        $http.get(config.baseEndpoint + '/resources').success(function(data){
                            d.resolve(data.resources);
                        });
                        return d.promise;
                    }]
                }
            });

            ROUTER.install($routeProvider);
        },

        $get: function(){
            return {

                getRoute: function(key) {
                    return lookup[key];
                },

                replaceUrlParams: function(url, params) {
                    for(var k in params) {
                        var v = params[k];
                        url = url.replace(':'+k,v);
                    }
                    return url;
                },

                routeDefined: function(key) {
                    return !! this.getRoute(key);
                },

                routePath: function(key, args) {
                    var url = this.getRoute(key);
                    url = url ? url.url : null;
                    if(url && args) {
                        url = this.replaceUrlParams(url, args);
                    }
                    return CONFIG.docs.routing.html5Mode ? url : '/#' + CONFIG.docs.routing.urlPrefix + url;
                },

                setApiHost: function(host){
                    CONFIG.docs.baseEndpoint = host;
                },
                setApiNamespace: function(namespace){
                    CONFIG.docs.apiNamespace = namespace;
                },
                setAuthToken: function(token){
                    CONFIG.docs.authToken = token;
                }
            }
        }
    }
}])

.run(['$rootScope', '$location', 'docs', 'editableOptions',
    function($rootScope, $location, docs, editableOptions) {
        var prefix = '';

        $rootScope.docsRoute = function(url, args) {
            return prefix + docs.routePath(url, args);
        };
        $rootScope.navbarEnabled = !!CONFIG.docs.enableNavbar;

        // bootstrap3 theme. Can be also 'bs2', 'default'
        editableOptions.theme = 'bs3';
    }]);