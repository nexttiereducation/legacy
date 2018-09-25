(function() {
    angular.module('api-svc')
        .service('WebsocketManager', websocketManager);

    websocketManager.$inject = ['localStorageService'];

    function websocketManager(localStorageService) {
        this.createNewConnection = createNewConnection;
        this.onNewMessageHandler = handleNewMessage;
        this.openSocket = null;
        this.send = send;
        this.addMessageHandler = addMessageHandler;
        this.messageHandlers = [];
        this.pathRoot = '';
        var that = this;


        function addMessageHandler(handlerFunction) {
            this.messageHandlers.push(handlerFunction);
        }

        function createNewConnection(pathRoot) {
            if (!localStorageService.get('authToken')) {
                return;
            }

            if (this.openSocket &&
                (this.openSocket.readyState === this.openSocket.OPEN ||
                this.openSocket.readyState === this.openSocket.CONNECTING)) {
                return;
            }
            this.pathRoot = pathRoot;
            this.openSocket = new WebSocket(getBaseSocketUrl(pathRoot));
            this.openSocket.onmessage = handleNewMessage;
        }

        function handleNewMessage(event) {
            that.messageHandlers.forEach(function(value) {
                value.apply(this, [event]);
            });
        }

        function send(message) {
            if (!this.openSocket && this.openSocket.readyState !== this.openSocket.OPEN) {
                createNewConnection(this.pathRoot);
            }
            this.openSocket.send(message);
        }

        function getBaseSocketUrl(pathRoot) {
            var socketUrl = pathRoot.indexOf('https') > -1 ?
                        pathRoot.replace('https', 'wss') :
                        pathRoot.replace('http', 'ws');
            var authToken = localStorageService.get('authToken');
            return socketUrl + '?token=' + authToken;
        }
    }
})();
