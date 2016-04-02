/*eslint-env browser, jquery*/
/*globals angular */

// ==UserScript==
// @name         TalkDesk Real Time Statuses 2
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  realtime TalkDesk statuses
// @author       Douglas Gaskell
// @match        https://*.mytalkdesk.com/*
// @grant        none
// ==/UserScript==

$(document).ready(function() {
    'use strict';
(function AddLibraries(){
    var script1 = document.createElement("script");
    script1.setAttribute("src", "https://ajax.googleapis.com/ajax/libs/angularjs/1.5.0/angular.min.js");
    document.body.appendChild(script1);

    var script2 = document.createElement("script");
    script2.setAttribute("src", "https://cdn.rawgit.com/ROMB/jquery-dialogextend/master/build/jquery.dialogextend.min.js");
    document.body.appendChild(script2);

    var fontAwesome = document.createElement("link");
    fontAwesome.type = 'test/css';
    fontAwesome.setAttribute("rel", "stylesheet");
    fontAwesome.setAttribute('src', 'https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css');

    var style = document.createElement("style");
    style.type = 'text/css';
    style.appendChild(document.createTextNode('.ui-dialog{ border-radius:0px !important; } '+
                                              '.ui-dialog-titlebar-buttonpane a { background: #596C7D !important; border: 0px !important; margin: 0px 1px 0px 1px !important; }'+
                                              '.statusSettingsAccordion h3.ui-accordion-header {border: 0px; text-align:center; border-width: 1px 2px; border-style: solid; border-color: #272A2D; background: #303941; color: white; padding: 2px; margin: 0px;}'+
                                              '.statusSettingsAccordion div.ui-accordion-content {background: #5D676F; border-width: 1px 2px; border-style: solid; border-color: #272A2D; height: auto;}'+
                                              '.statusSettingsAccordion > :first-child { margin-top:10px !important;}'
                                             ));
    style.setAttribute("type", "text/css");
    document.body.appendChild(style);

    window.setTimeout(Main, 5000);
})();


var config = {
    statusConfig: {
            'available':{
                name:"Available",
                id:"available",
                color: true,
                exactMatch: true,
                maxTime: 60
            },
            'after_call_work':{
                name:"Followup",
                id:"after_call_work",
                color: true,
                exactMatch: true,
                maxTime: 180
            },
            'busy_hq-shiftlead':{
                name:"HQ Shift Lead",
                id:"busy_hq-shiftlead",
                color: false,
                exactMatch: true,
                maxTime: -1
            },
            'busy_hq-mctexts':{
                name:"HQ MC/Texts",
                id:"busy_hq-mctexts",
                color: false,
                exactMatch: true,
                maxTime: -1
            },
            'busy_dasherchat':{
                name:"Dasher Chat",
                id:"busy_dasherchat",
                color: false,
                exactMatch: true,
                maxTime: -1
            },
            'busy_customeremails':{
                name:"Customer Emails",
                id:"busy_customeremails",
                color: false,
                exactMatch: true,
                maxTime: -1
            },
            'busy_dasheremails':{
                name:"Dasher Emails",
                id:"busy_dasheremails",
                color: false,
                exactMatch: true,
                maxTime: -1
            },
            'busy':{
                name:"On a Call",
                id:"busy",
                color: true,
                exactMatch: true,
                maxTime: 300
            },
            'away':{
                name:"Login Prep",
                id:"away",
                color: true,
                exactMatch: true,
                maxTime: 60
            },
            'away_break1':{
                name:"Break",
                id:"away_break",
                color: true,
                exactMatch: false,
                maxTime: 1080
            },
            'away_break2':{
                name:"Break",
                id:"away_break",
                color: true,
                exactMatch: false,
                maxTime: 1080
            },
            'away_break3':{
                name:"Break",
                id:"away_break",
                color: true,
                exactMatch: false,
                maxTime: 1080
            },
            'away_lunch':{
                name:"Lunch",
                id: "away_lunch",
                color: true,
                exactMatch: true,
                maxTime: 2100
            },
            'away_nonbillable':{
                name:"Non-Billable",
                id:"away_nonbillable",
                color: false,
                exactMatch: true,
                maxTime: -1
            },
            'away_feedbackcoachingmeeting':{
                name:"Feedback/Coaching/Meeting",
                id: "away_feedbackcoachingmeeting",
                color: false,
                exactMatch: true,
                maxTime: -1
            },
            'offline':{
                name:"Offline",
                id:"offline",
                color: false,
                exactMatch: true,
                maxTime: -1
            }
    }
};

function Main(){

            //All the HTML that needs to be inserted into the DOM
            $('body').prepend(
            '<div id="userStatuses" title="{{users.currentUser.canAccessAdmin ? statuses.statusHash[statuses.selectedStatus].name : statuses.statusHash[users.usersHash[users.currentUser.id].currentStatus].name}} {{users.currentUser.canAccessAdmin ? \'Timers\' : \'Timer\'}}" style="overflow-y:auto;">'+
                '<table id="statusTable" class="table table-bordered table-condensed" style="border-radius: 0px; text-align:center;">'+
                    '<thead>'+
                        '<tr>'+
                            '<th ng-if="users.currentUser.canAccessAdmin" style="border-radius: 0px; font-size: 110%; font-weight:600; text-align: center;">Name</th>'+
                            '<th ng-if="!users.currentUser.canAccessAdmin" style="border-radius: 0px; font-size: 110%; font-weight:600; text-align: center;">Status</th>'+
                            '<th style="border-radius: 0px; font-size: 110%; font-weight:600; text-align: center;">Time</th>'+
                        '</tr>'+
                    '</thead>'+
                    '<tbody>'+
                        '<tr ng-if="users.currentUser.canAccessAdmin" style="background: hsl({{user.hue}}, 100%, {{user.level}})" ng-repeat="user in users.usersHash | toArray | filter:{currentStatus: statuses.statusHash[statuses.selectedStatus].id} : statuses.statusHash[statuses.selectedStatus].exactMatch | negativeSplitFilter: hideMatchingText | orderBy: ' + "'" + 'timeInStatus' + "'" +':true">'+
                            '<td style="text-align: center; border-color:#dddddd; padding-top: 2px !important; padding-bottom:2px !important; height: auto;">{{user.name}}</td>'+
                            '<td style="text-align: center; border-color:#dddddd; padding-top: 2px !important; padding-bottom:2px !important; height: auto;">{{user.timeInStatus | date: "H:mm:ss": "UTC"}}</td>'+
                        '</tr>'+
                        '<tr ng-if="!users.currentUser.canAccessAdmin" style="background: hsl({{user.hue}}, 100%, {{user.level}})">'+
                            '<td style="text-align: center; border-color:#dddddd; padding-top: 2px !important; padding-bottom:2px !important; height: auto;">{{statuses.statusHash[users.usersHash[users.currentUser.id].currentStatus].name}}</td>'+
                            '<td style="text-align: center; border-color:#dddddd; padding-top: 2px !important; padding-bottom:2px !important; height: auto;">{{users.usersHash[users.currentUser.id].timeInStatus | date: "H:mm:ss": "UTC"}}</td>'+
                        '</tr>'+
                    '</tbody>'+
                '</table></div>' );
                $('#userStatuses').dialog({
                    resize: function(event, ui){
                    }
                }).dialogExtend({
                    closable : false,
                    maximizable : false,
                    collapsable : true,
                    dblclick : "collapse",
                    minimizable : true,
                    minimizeLocation : "right"
                });
                $('.ui-dialog-titlebar').css('position', 'relative');
                $('#userStatuses').parent().attr("ng-app", "statusesApp");
                $('#userStatuses').parent().attr("ng-controller", "statusesAppController");
                /*$('#userStatuses').parent().append(
                    '<div style="color: white;" id="settingsAccordian">'+
                        '<h3 style="border: 0px; text-align:center;">Settings</h3>'+
                        '<div style="background: #303941;">'+
                            '<div ng-if="users.currentUser.canAccessAdmin" style="width: 100%; font-size: 1em;">'+
                                '<select ng-model="statuses.selectedStatus" style="width: auto;">'+
                                    '<option id="{{status.id}}" value="{{status.id}}" ng-repeat="status in statuses.statusArray | unique: \'name\'">{{status.name}}</option>'+
                                '</select>'+
                            '</div>'+
                            '<div ng-if="users.currentUser.canAccessAdmin" style="width: 100%; font-size: 1em;">'+
                                '<label for="hideMatching">Hide Matching:</label>'+
                                '<input type="text" ng-model="$parent.hideMatchingText" style="width: auto; padding: 6px 6px; box-shadow: none; margin: auto auto 10px 0px; font-family: Verdana, Arial, sans-serif; border: 0px; font-size: 1em;">'+
                            '</div>'+
                            '<div ng-if="users.currentUser.canAccessAdmin" style="width: 100%; font-size: 1em;">'+
                                '<label ng-if="statuses.statusHash[statuses.selectedStatus].color" for="hideMatching">Highest {{statuses.statusHash[statuses.selectedStatus].name}} Permitted (s)</label>'+
                                '<input ng-if="statuses.statusHash[statuses.selectedStatus].color" type="number" ng-model="statuses.statusHash[statuses.selectedStatus].maxTime" id="hideMatching" style="width: auto;">'+
                            '</div>'+
                        '</div>'+
                    '</div>');*/
                /*$('#userStatuses').parent().append('<div class="horizontalSlideOut" style="position: absolute;width: 150px; height: 100%; top:0px; background: #303941; right: -150px;"> Stuff And Stuff'+
                                                       '<div class="statusSettingsAccordion">'+
                                                           '<div class="panel-group">'+
                                                               '<div ng-repeat="status in statuses.statusArray" class="panel panel-default">'+
                                                                   '<div class="panel-heading">'+
                                                                       '<h4 class="panel-title">'+
                                                                           '<a data-toggle="collapse" href="#settingsCollapse{{$index}}">{{status.name}}</a>'+
                                                                       '</h4>'+
                                                                   '</div>'+
                                                                   '<div id="settingsCollapse{{$index}}" class="panel-collapse collapse in">'+
                                                                       '<div class="panel-body">{{status.id}}</div>'+
                                                                   '</div>'+
                                                               '</div>'+
                                                           '</div>'+
                                                           '<h3 ng-repeat-start="status in statuses.statusArray">{{status.name}}</h3>'+
                                                           '<div ng-repeat-end>{{status.id}}</div>'+
                                                       '<div>'+
                                                   '</div>');*/
                $('#userStatuses').parent().append('<div class="horizontalSlideOut" style="position: absolute;width: 200px; height: 100%; top:0px; background: #303941; right: -200px; overflow-y:auto; overflow-x:hide;">'+
                                                       '<div class="statusSettingsAccordion">'+
                                                           '<h3 ng-repeat-start="status in statuses.statusArray">{{status.name}}</h3>'+
                                                           '<div ng-repeat-end>{{status}}'+
                                                               '<div>'+
                                                               '</div>'+
                                                           '</div>'+
                                                       '<div>'+
                                                   '</div>');
                $('#userStatuses').parent().append('<div id="userStatusesSettingsBtn" class="btn btn-info">Settings</div>');
                window.setTimeout(function(){
                    $('.statusSettingsAccordion').accordion({
                        collapsible: true,
                        active: false,
                        icons: false
                    });
                }, 1000);
                $('#userStatusesSettingsBtn').click(function(){
                    $('.horizontalSlideOut').toggle('slide', {}, 400);
                });

                /*$('#settingsAccordian').accordion({
                    collapsible: true,
                    active: false,
                    icons: false
                });*/

    //Primary Angular module
    var statusesApp = angular.module("statusesApp", []);

    //Factory managing the users themselves
    statusesApp.factory("Users", function(){
        var users = {};
        users.currentUser = {};
        users.usersHash = {};

        //Called to setup all users, users from TalkDesk model passed in
        users.SetAllUsers = function(usersArray){
            for(var i = 0; i < usersArray.length; i++){
                var newUser = {
                    id: usersArray[i].id,
                    name: usersArray[i].attributes.name,
                    currentStatus: usersArray[i].attributes.status,
                    timeChanged: usersArray[i].attributes.updated_at,
                    timeInStatus:0,
                    hue: 110,
                    level: '88%'
                };

                users.usersHash[usersArray[i].id] = newUser;
            }
        };

        //Sets the current user from the TalkDesk model
        users.SetCurrentUser = function(newUser){
            users.currentUser.id = newUser.id;
            users.currentUser.name = newUser.attributes.name;
            users.currentUser.canAccessAdmin = newUser.attributes.permissions_profile.admin.accessible;
        };

        //Adds a new suer to the hash, should almost never be used
        users.NewUser = function(requestObject){
            var newUser = {
                id: requestObject._id,
                name: requestObject.name,
                currentStatus: requestObject.status,
                timeChanged: requestObject.updated_at,
                timeInStatus:0,
                hue: 110,
                level: '88%'
            };
            users.usersHash[requestObject._id] = newUser;
        };

        users.UpdateUserStatus = function(userId, status, updated_at ){
            users.usersHash[userId].currentStatus = status;
            users.usersHash[userId].timeChanged = updated_at;
            users.usersHash[userId].timeInStatus = 0;
        };

        return users;
    });

    //Service managing everything status related
    statusesApp.factory('Statuses',["Users", function(users){
        var statuses = {};
        statuses.selectedStatus = 'after_call_work';
        statuses.statusArray = [];
        statuses.statusHash = {};

        //Sets up the statuses based on the models statuses and the config
        statuses.setStatuses = function(statusesObject, statusesConfig){
            for(var status in statusesObject){
                if(statusesConfig.hasOwnProperty(status)){
                    var statusToPush = statusesConfig[status];
                    statusToPush.id = status;                  //Necessary to use the real ID of the status instead of the config id
                    statuses.statusArray.push(statusToPush);   //Pushing the config status instead of the defaults
                    statuses.statusHash[status] = statusesConfig[status];
                }
                else{
                    statuses.statusArray.push({name: statusesObject[status], id: status, color: false, exactMatch: true, maxTime: -1});
                    statuses.statusHash[status] = statusesObject[status];
                }
            }
        };

        statuses.ProcessStatusChange = function(requestObject, type){
            //If user exists in hash already
            if(type == 'userInfo'){
                if(typeof users.usersHash[requestObject._id] !== 'undefined') {
                    if(users.usersHash[requestObject._id].currentStatus != requestObject.status){
                        users.UpdateUserStatus(requestObject._id, requestObject.status, requestObject.updated_at);
                    }
                } else {
                    users.NewUser(requestObject);
                }
            }else if(type == 'callInfo'){
                if(typeof users.usersHash[requestObject.user_id] !== 'undefined') {
                    if(users.usersHash[requestObject.user_id].currentStatus != 'busy'){
                        users.UpdateUserStatus(requestObject.user_id, 'busy', requestObject.answered_at);
                    }
                }
            }
        };

        //Processes all users times, called periodically to regularly update
        statuses.CalculateStatusTimes = function(statusConfig){
            for(var user in users.usersHash){
            	if(users.usersHash.hasOwnProperty(user)){
                    var timeData = statuses.CalculateStatusTime(statusConfig, user);

	                users.usersHash[user].timeInStatus = timeData.diff;
	                users.usersHash[user].hue = timeData.hue;
	                users.usersHash[user].level = timeData.level;
            	}
            }
        };

        //Calculates the time data for a single user
        statuses.CalculateStatusTime = function(statusConfig, user){
            var startMs = new Date(users.usersHash[user].timeChanged).getTime();
            var nowMs = new Date().getTime();
            var diff = (nowMs - startMs);
            var hue = 110;
            var level = statusConfig[users.usersHash[user].currentStatus].color?'88%':'100%';
            hue = Math.max(110 - Math.abs((diff/1000*(110/statusConfig[users.usersHash[user].currentStatus].maxTime))), 0);
            return {diff: diff, hue: hue, level: level};
        };
        return statuses;
    }]);

    //Angular controller for the app
    statusesApp.controller("statusesAppController", ["$scope", "Statuses", "Users", function($scope, Statuses, Users){
        $scope.statuses = Statuses;
        $scope.users = Users;

        $scope.config = config;
        $scope.statuses.setStatuses(App.Vars.company.attributes.custom_status, $scope.config.statusConfig);
        $scope.users.SetAllUsers(App.Vars.agents.models);
        $scope.users.SetCurrentUser(App.Vars.agent);

        $scope.hideMatchingText = "";
        //The handler for AJAX requests
        $scope.SetupAJAXHandler = function(open) {

            XMLHttpRequest.prototype.open = function() {
                this.addEventListener("readystatechange", function() {
                    if(this.readyState == 4)
                    {
                        var xmlResponseText = this.responseText;
                        if(typeof xmlResponseText != 'undefined' && xmlResponseText != ""){
                            var responseObject = {};
                            try{
                                responseObject = JSON.parse(xmlResponseText);
                            }
                            catch(e) {
                                console.error(e);
                                console.error(xmlResponseText);
                                console.error(xmlResponseText);
                                console.error("JSON Parse Failed");
                           }
                            if(typeof responseObject._id != 'undefined'){
                                if(typeof responseObject.status != 'undefined'){
                                    $scope.statuses.ProcessStatusChange(responseObject, 'userInfo');
                                }else if(typeof responseObject.callsid != 'undefined'){
                                    $scope.statuses.ProcessStatusChange(responseObject, 'callInfo');
                                }
                            }
                        }
                    }
                }, false);
                open.apply(this, arguments);
            };

        };

        //Sets the timer for when times are recalcualted, 500ms at the moment
        $scope.SetupTimer = function(){
            setInterval(function(){$scope.statuses.CalculateStatusTimes($scope.config.statusConfig); $scope.$apply();}, 500);
        };

        $scope.Unload = function(){
            $(window).unload(function(){
                $.ajax({
                    url: 'https://doordash.mytalkdesk.com/users/' + $scope.users.currentUser.id,
                    type: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    async: false,
                    timeout: 250,
                    data: '{"user":{"status":"offline","status_change":true,"reason":"automated"}}'
                });
            });
        };

        $scope.SetupAJAXHandler(XMLHttpRequest.prototype.open);
        $scope.SetupTimer();
        $scope.Unload();
    }]);

    //Converts an associative array to an array https://github.com/petebacondarwin/angular-toArrayFilter
    statusesApp.filter('toArray', function () {
      return function (obj, addKey) {
        if (!angular.isObject(obj)) return obj;
        if ( addKey === false ) {
          return Object.keys(obj).map(function(key) {
            return obj[key];
          });
        } else {
          return Object.keys(obj).map(function (key) {
            var value = obj[key];
            return angular.isObject(value) ?
              Object.defineProperty(value, '$key', { enumerable: false, value: key}) :
              { $key: key, $value: value };
          });
        }
      };
    });

    /**
     * https://github.com/angular-ui/angular-ui-OLDREPO/blob/master/modules/filters/unique/unique.js
     * Filters out all duplicate items from an array by checking the specified key
     * @param [key] {string} the name of the attribute of each object to compare for uniqueness
     if the key is empty, the entire object will be compared
     if the key === false then no filtering will be performed
     * @return {array}
     */
    statusesApp.filter('unique', function () {

      return function (items, filterOn) {

        if (filterOn === false) {
          return items;
        }

        if ((filterOn || angular.isUndefined(filterOn)) && angular.isArray(items)) {
          var hashCheck = {}, newItems = [];

          var extractValueToCompare = function (item) {
            if (angular.isObject(item) && angular.isString(filterOn)) {
              return item[filterOn];
            } else {
              return item;
            }
          };

          angular.forEach(items, function (item) {
            var valueToCheck, isDuplicate = false;

            for (var i = 0; i < newItems.length; i++) {
              if (angular.equals(extractValueToCompare(newItems[i]), extractValueToCompare(item))) {
                isDuplicate = true;
                break;
              }
            }
            if (!isDuplicate) {
              newItems.push(item);
            }

          });
          items = newItems;
        }
        return items;
      };
    });

    //Filters out multiple values from a string using '|' as a delimiter
    statusesApp.filter('negativeSplitFilter', ['$filter', function($filter){
        return function(items, filterString){
            console.info('Filter String: ' + filterString);
            if(filterString != ''){
                var output = [];
                var filterValues = filterString.split('|');
                for(var i = 0; i < filterValues.length; i++){
                    if(filterValues[i] != ''){
                        filterValues[i] = filterValues[i].trim();
                    }else{
                        filterValues.splice(i, 1);
                    }
                }

                angular.forEach(items, function(item){
                    var match = false;
                    angular.forEach(item, function(key, value){
                        for(var  i =0; i < filterValues.length; i++){
                            if(String(key).includes(filterValues[i])){
                                match = true;
                            }
                        }
                    });
                    if(!match){
                        output.push(item);
                    }
                });
                return output;
            }
            return items;
        };
    }]);

    angular.bootstrap($('#userStatuses').parent(), ['statusesApp']);
}

function Sleep(milliseconds) {
   var currentTime = new Date().getTime();

   while (currentTime + miliseconds >= new Date().getTime()) {
   }
}
});
