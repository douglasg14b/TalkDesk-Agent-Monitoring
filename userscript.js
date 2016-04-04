/*eslint-env browser, jquery*/
/*globals angular */
/*jshint multistr: true */

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
                                              '.statusSettingsAccordion h3.ui-accordion-header {white-space: nowrap; font-size: 1.3em; border: 0px; text-align:center; border-width: 1px 2px; border-style: solid; border-color: #272A2D; background: #303941; color: white; padding: 2px; margin: 0px;}'+
                                              '.statusSettingsAccordion div.ui-accordion-content { color: white; padding: 1em 1.8em; background: #5D676F; border-width: 1px 2px; border-style: solid; border-color: #272A2D;}'+
                                              '.statusSettingsAccordion > :first-child { margin-top:10px !important;}'+
                                              '#statusTable tbody td {text-align: center; border-color:#dddddd; padding-top: 2px !important; padding-bottom:2px !important; height: auto;}'
                                             ));
    style.setAttribute("type", "text/css");
    document.body.appendChild(style);

    //Wait for agents to be defined
    (function f(){
        if(typeof App.Vars.agents !== 'undefined'){
            window.setTimeout(Main, 2500);
        } else {
            window.setTimeout(f, 250);
        }
    })();
})();


var config = {
    statusConfig: {
            'available':{
                name:"Available",
                id:"available",
                color: true,
                customGrouping: false,
                groupBy: "available",
                maxTime: 60
            },
            'after_call_work':{
                name:"Followup",
                id:"after_call_work",
                color: true,
                customGrouping: false,
                groupBy: "after_call_work",
                maxTime: 180
            },
            'busy_hq-shiftlead':{
                name:"HQ Shift Lead",
                id:"busy_hq-shiftlead",
                color: false,
                customGrouping: false,
                groupBy: "busy_hq-shiftlead",
                maxTime: -1
            },
            'busy_hq-mctexts':{
                name:"HQ MC/Texts",
                id:"busy_hq-mctexts",
                color: false,
                customGrouping: false,
                groupBy: "busy_hq-mctexts",
                maxTime: -1
            },
            'busy_dasherchat':{
                name:"Dasher Chat",
                id:"busy_dasherchat",
                color: false,
                customGrouping: false,
                groupBy: "busy_dasherchat",
                maxTime: -1
            },
            'busy_customeremails':{
                name:"Customer Emails",
                id:"busy_customeremails",
                color: false,
                customGrouping: false,
                groupBy: "busy_customeremails",
                maxTime: -1
            },
            'busy_dasheremails':{
                name:"Dasher Emails",
                id:"busy_dasheremails",
                color: false,
                customGrouping: false,
                groupBy: "busy_dasheremails",
                maxTime: -1
            },
            'busy':{
                name:"On a Call",
                id:"busy",
                color: true,
                customGrouping: false,
                groupBy: "busy",
                maxTime: 300
            },
            'away':{
                name:"Login Prep",
                id:"away",
                color: true,
                customGrouping: false,
                groupBy: "away",
                maxTime: 60
            },
            'away_break1':{
                name:"Break 1",
                id:"away_break",
                color: true,
                customGrouping: true,
                groupBy: "Break",
                maxTime: 1080
            },
            'away_break2':{
                name:"Break 2",
                id:"away_break",
                color: true,
                customGrouping: true,
                groupBy: "Break",
                maxTime: 1080
            },
            'away_break3':{
                name:"Break 3",
                id:"away_break",
                color: true,
                customGrouping: true,
                groupBy: "Break",
                maxTime: 1080
            },
            'away_lunch':{
                name:"Lunch",
                id: "away_lunch",
                color: true,
                customGrouping: false,
                groupBy: "away_lunch",
                maxTime: 2100
            },
            'away_nonbillable':{
                name:"Non-Billable",
                id:"away_nonbillable",
                color: false,
                customGrouping: false,
                groupBy: "away_nonbillable",
                maxTime: -1
            },
            'away_feedbackcoachingmeeting':{
                name:"Feedback/Coaching/Meeting",
                id: "away_feedbackcoachingmeeting",
                color: false,
                customGrouping: false,
                groupBy: "away_feedbackcoachingmeeting",
                maxTime: -1
            },
            'offline':{
                name:"Offline",
                id:"offline",
                color: false,
                customGrouping: false,
                groupBy: "offline",
                maxTime: -1
            }
    }
};

function Main(){

            //All the HTML that needs to be inserted into the DOM
            $('body').prepend(
            '<div id="userStatuses" title="{{users.currentUser.canAccessAdmin ? statuses.statusHash[statuses.selectedStatus].customGrouping ? statuses.statusHash[statuses.selectedStatus].groupBy : statuses.statusHash[statuses.selectedStatus].name : statuses.statusHash[users.usersHash[users.currentUser.id].currentStatus].name}} {{users.currentUser.canAccessAdmin ? \'Timers\' : \'Timer\'}}" style="overflow-y:auto;">'+
                '<table id="statusTable" class="table table-bordered table-condensed" style="border-radius: 0px; text-align:center;">'+
                    '<thead>'+
                        '<tr>'+
                            '<th ng-if="users.currentUser.canAccessAdmin" style="border-radius: 0px; font-size: 110%; font-weight:600; text-align: center;">Name</th>'+
                            '<th ng-if="!users.currentUser.canAccessAdmin" style="border-radius: 0px; font-size: 110%; font-weight:600; text-align: center;">Status</th>'+
                            '<th style="border-radius: 0px; font-size: 110%; font-weight:600; text-align: center;">Time</th>'+
                        '</tr>'+
                    '</thead>'+
                    '<tbody>'+
                        '<tr ng-if="users.currentUser.canAccessAdmin && !statuses.statusHash[statuses.selectedStatus].customGrouping" style="background: hsl({{user.hue}}, 100%, {{user.level}})" ng-repeat="user in users.usersHash | toArray | filter:{currentStatus: statuses.statusHash[statuses.selectedStatus].id} | negativeSplitFilter: hideMatchingText | orderBy: ' + "'" + 'timeInStatus' + "'" +':true">'+
                            '<td><change-user-status-dropdown/></td>'+
                            '<td>{{user.timeInStatus | date: "H:mm:ss": "UTC"}}</td>'+
                        '</tr>'+
                        '<tr ng-if="users.currentUser.canAccessAdmin && statuses.statusHash[statuses.selectedStatus].customGrouping" style="background: hsl({{user.hue}}, 100%, {{user.level}})" ng-repeat="user in users.usersHash | toArray | filter:{currentStatus: statuses.statusHash[statuses.selectedStatus].groupBy} : false | negativeSplitFilter: hideMatchingText | orderBy: ' + "'" + 'timeInStatus' + "'" +':true">'+
                            '<td><change-user-status-dropdown/></td>'+
                            '<td>{{user.timeInStatus | date: "H:mm:ss": "UTC"}}</td>'+
                        '</tr>'+
                        '<tr ng-if="!users.currentUser.canAccessAdmin" style="background: hsl({{user.hue}}, 100%, {{user.level}})">'+
                            '<td>{{statuses.statusHash[users.usersHash[users.currentUser.id].currentStatus].name}}</td>'+
                            '<td>{{users.usersHash[users.currentUser.id].timeInStatus | date: "H:mm:ss": "UTC"}}</td>'+
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

                //The config/settings window
                $('#userStatuses').parent().append('<div class="horizontalSlideOut" style="box-sizing: border-box; position: absolute; opacity:0; width: 0px; top:0px; background: #303941; right: 0px; height: 100%; padding: 10px 5px;"><div  style=" height: 100%; overflow-y:auto; overflow-x:hide;">'+
                                                       '<div>'+
                                                           '<label for="hideMatching" style="color: white;">Hide Matching:</label>'+
                                                           '<input type="text" ng-model="hideMatchingText" style="width: 200px; padding: 6px 6px; box-shadow: none; margin: auto auto 10px 0px; font-family: Verdana, Arial, sans-serif; border: 0px; font-size: 1em;">'+
                                                       '</div>'+
                                                       '<div class="checkbox">'+
                                                           '<label style="color: white;"><input type="checkbox" ng-model="offlineWhenClosed">Auto Offline</label>'+
                                                       '</div>'+
                                                       '<div class="statusSettingsAccordion">'+
                                                           '<h3 ng-repeat-start="status in statuses.statusArray">'+
                                                               '<span>{{status.name}}</span>'+
                                                           '</h3>'+
                                                           '<div ng-repeat-end>'+
                                                               'ID: <span style="font-size: 0.9em;">{{status.id}}</span>'+
                                                               '<div class="checkbox">'+
                                                                   '<label><input type="checkbox" ng-change="!status.customGrouping ? status.groupBy = status.id : null" ng-model="status.customGrouping">Custom Grouping</label>'+
                                                               '</div>'+
                                                               '<div ng-if="status.customGrouping">'+
                                                                   '<label for="statusMatchBy{{status.id}}" style="white-space: nowrap;">Group Name</label>'+
                                                                   '<input id="statusMatchBy{{status.id}}" type="text" ng-model="status.groupBy" style="width: 150px; padding: 2px 2px; box-shadow: none; margin: auto auto 10px 0px; font-family: Verdana, Arial, sans-serif; border: 0px; font-size: 1em;">'+
                                                               '</div>'+
                                                               '<div class="checkbox">'+
                                                                   '<label><input type="checkbox" ng-model="status.color">Color</label>'+
                                                               '</div>'+
                                                               '<div>'+
                                                                   '<label for="statusName{{status.id}}" style="white-space: nowrap;">Display Name</label>'+
                                                                   '<input type="text" ng-model="status.name" style="width: 150px; padding: 2px 2px; box-shadow: none; margin: auto auto 10px 0px; font-family: Verdana, Arial, sans-serif; border: 0px; font-size: 1em;">'+
                                                               '</div>'+
                                                               '<div ng-if="status.color">'+
                                                                   '<label for="hideMatching{{status.id}}" style="white-space: nowrap;">Highest {{status.name}} Permitted (s)</label>'+
                                                                   '<input type="number" ng-model="status.maxTime" id="hideMatching{{status.id}}" style="width: 75px; padding: 2px 2px;">'+
                                                               '</div>'+
                                                           '</div>'+
                                                       '<div>'+
                                                   '</div></div>');

                //Appends the html for the settings button and statuses dropdown
                $('#userStatuses').parent().append(
                            '<div ng-if="users.currentUser.canAccessAdmin" style="font-size: 1em; margin-top: 3px;">\
                                <div id="userStatusesSettingsBtn" class="userStatusesSettingsBtn btn btn-info">Settings</div>\
                                <select ng-model="statuses.selectedStatus" style="width: 150px; float:right; height: 35px;">\
                                    <option id="{{status.id}}" value="{{status.id}}" ng-repeat="status in statuses.statusArray | unique: \'groupBy\'">{{status.customGrouping ? status.groupBy : status.name}}</option>\
                                </select> \
                            </div>');

                //Setup the config accordians and click event to toggle the configs
                window.setTimeout(function(){
                    $('.statusSettingsAccordion').accordion({
                        collapsible: true,
                        active: false,
                        icons: false,
                        heightStyle: "content"
                    });

                    $('.userStatusesSettingsBtn').click(function(){
                        //Cannot cleanly use toggle with a box-sizing:border-box; using aniamtion instead
                        var slideOut = $(".horizontalSlideOut");
                        if(slideOut.hasClass('active')){
                            slideOut.animate({
                                width: '0',
                                right: '0',
                                opacity: '0'
                            }, 400);
                        } else {
                            slideOut.animate({
                                width: '250',
                                right: '-250',
                                opacity: '100'
                            }, 400);
                        }
                        slideOut.toggleClass('active');

                    });
                }, 1000);

    //Primary Angular module
    var statusesApp = angular.module("statusesApp", []);

    //Config and user settings factory
    statusesApp.factory('Config', function(){
        var config = {};
        config.storage = localStorage;
        config.configData = null;

        //Gets the initial config data
        config.InitializeConfig = function(){
            var data = config.storage.getItem('talkdeskStatusesConfig');
            if(data !== null){
                config.configData = JSON.parse(data);
            }
        };

        //Gets the initial config data
        config.GetConfig = function(key){
            if(config.configData !== null){
                if(config.configData.hasOwnProperty(key)){
                    return config.configData[key];
                }
            }
            return null;
        };

        //Sets the localstorage item
        config.SetConfig = function(data, type){
            if(config.configData !== null){
                config.configData[type] = data;
                config.storage.setItem('talkdeskStatusesConfig', JSON.stringify(config.configData));
            } else {
                config.configData = {};
                config.configData[type] = data;
                config.storage.setItem('talkdeskStatusesConfig', JSON.stringify(config.configData));
            }
        };

        return config;
    });

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
    statusesApp.factory('Statuses',["Users","Config", function(users, config){
        var statuses = {};
        statuses.selectedStatus = 'after_call_work';
        statuses.statusArray = [];
        statuses.statusHash = {};

        //Sets up the statuses based on the models statuses and the config
        statuses.setStatuses = function(statusesObject){
            for(var status in statusesObject){
                if(config.configData !== null){
                    if(config.configData.statusConfig.hasOwnProperty(status)){
                        var statusToPush = config.configData.statusConfig[status];
                        statusToPush.id = status;
                        statuses.statusArray.push(statusToPush);
                        statuses.statusHash[status] = config.configData.statusConfig[status];
                        continue;
                    }
                }
                var statusToPush = {name: statusesObject[status], id: status, color: false, customGrouping: false, groupBy:status, maxTime: -1};
                statuses.statusArray.push(statusToPush);
                statuses.statusHash[status] = statusToPush;
            }
            config.SetConfig(statuses.statusHash, 'statusConfig');
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
        statuses.CalculateStatusTimes = function(){
            for(var user in users.usersHash){
            	if(users.usersHash.hasOwnProperty(user)){
                    var timeData = statuses.CalculateStatusTime(user);

	                users.usersHash[user].timeInStatus = timeData.diff;
	                users.usersHash[user].hue = timeData.hue;
	                users.usersHash[user].level = timeData.level;
            	}
            }
        };

        //Calculates the time data for a single user
        statuses.CalculateStatusTime = function(user){
            var startMs = new Date(users.usersHash[user].timeChanged).getTime();
            var nowMs = new Date().getTime();
            var diff = (nowMs - startMs);
            var hue = 110;
            var level = statuses.statusHash[users.usersHash[user].currentStatus].color?'88%':'100%';
            hue = Math.max(110 - Math.abs((diff/1000*(110/statuses.statusHash[users.usersHash[user].currentStatus].maxTime))), 0);
            return {diff: diff, hue: hue, level: level};
        };
        return statuses;
    }]);

    //Angular controller for the app
    statusesApp.controller("statusesAppController", ["$scope", "$timeout", "Statuses", "Users", "Config", function($scope, $timeout, Statuses, Users, Config){
        $scope.statuses = Statuses;
        $scope.users = Users;
        $scope.config = Config;

        $scope.config.InitializeConfig();
        $scope.statuses.setStatuses(App.Vars.company.attributes.custom_status);
        $scope.users.SetAllUsers(App.Vars.agents.models);
        $scope.users.SetCurrentUser(App.Vars.agent);

        $scope.hideMatchingText = $scope.config.GetConfig('hideMatchingText') === null ? '' : $scope.config.GetConfig('hideMatchingText');
        $scope.offlineWhenClosed = $scope.config.GetConfig('offlineWhenClosed') === null ? true : $scope.config.GetConfig('offlineWhenClosed');

        var statusesTimeout = $timeout(function(){}); // Debouncer timer for statuses
        var hideMatchingTimeout = $timeout(function(){}); // Debouncer timer for hideMatchingText

        //Watch statuses config for changes, write to localStorage on debounced change
        $scope.$watch('statuses.statusHash', function(newVal, oldVal){
            $timeout.cancel(statusesTimeout);
            statusesTimeout = $timeout(function(){
                $scope.config.SetConfig($scope.statuses.statusHash, 'statusConfig');
            }, 500);
        }, true);

        //Watch hideMatchingText config for changes, write to localStorage on debounced change
        $scope.$watch('hideMatchingText', function(newVal, oldVal){
            $timeout.cancel(statusesTimeout);
            hideMatchingTimeout = $timeout(function(){
                $scope.config.SetConfig(newVal, 'hideMatchingText');
            }, 500);
        }, true);

        //Watch offlineWhenClosed config for changes, write to localStorage on change
        $scope.$watch('offlineWhenClosed', function(newVal, oldVal){
            $scope.config.SetConfig(newVal, 'offlineWhenClosed');
        });



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
            setInterval(function(){$scope.statuses.CalculateStatusTimes(); $scope.$apply();}, 500);
        };

        $scope.Unload = function(){
            $(window).unload(function(){
                //var agent = {};
                //angular.copy(App.Vars.agent.attributes, agent);
                //Can either send the entire agents info with the request or just the following, both seem to work

                if($scope.offlineWhenClosed){
                    $.ajax({
                        url: 'https://'+ window.location.hostname +'/users/' + $scope.users.currentUser.id,
                        type: 'PUT',
                        headers: {
                            'Accept':'application/json, text/javascript, */*; q=0.01',
                            'Accept-Language':'en-US,en;q=0.8',
                            'Content-Type': 'application/json'
                        },
                        timeout: 250,
                        data: '{"user":{"status":"offline","status_change":true,"reason":"automated"}}'
                    });
                }
            });
        };

        $scope.SetupAJAXHandler(XMLHttpRequest.prototype.open);
        $scope.SetupTimer();
        $scope.Unload();
    }]);

    //Directive defining a user status dropdown template
    statusesApp.directive('changeUserStatusDropdown', function(){
        return{
            restrict: 'AE',
            replace: true,
            template: '<div class="dropdown pull-left">\
                           <div dropdown-clear class="dropdown-toggle" data-toggle="dropdown">\
                               {{user.name}}\
                               <span class="caret"></span>\
                           </div>\
                           <ul style="position: fixed;"class="dropdown-menu">\
                               <li ng-repeat="status in statuses.statusArray"><a change-user-status userId="{{user.id}}" statusId="{{status.id}}">{{status.name}}</a></li>\
                           </ul>\
                       </div>'
        };
    });

    //Clears the dropdown from beign clipped by any overflow:hidden elements.
    //Implementation Courtesy of https://github.com/twbs/bootstrap/issues/7160 --> http://jsfiddle.net/Q5JvA/
    statusesApp.directive("dropdownClear", function(){
        var link = function(scope, element, attrs){
            element.bind('click', function(){
                var button = $(this);
                var dropdown = button.parent().find('.dropdown-menu');

                var dropDownTop = button.offset().top + button.outerHeight();
                dropdown.css('top', dropDownTop + "px");
                dropdown.css('left', button.offset().left + "px");
            });
        };
        return{
            link: link,
            scope: false
        };
    });

    //Directive when a status is selected when changing a users status
    statusesApp.directive('changeUserStatus', function(){
        var link = function(scope, element, attrs){
            var userID = attrs.userid;
            var statusID = attrs.statusid;
            if(typeof userID !== 'undefined' && typeof statusID !== 'undefined'){
                element.bind('click', function(){
                    var data = {user:{status:statusID, status_change:true, reason:null}};
                    $.ajax({
                        url: 'https://'+ window.location.hostname +'/users/' + userID,
                        type: 'PUT',
                        headers: {
                            'Accept':'application/json, text/javascript, */*; q=0.01',
                            'Accept-Language':'en-US,en;q=0.8',
                            'Content-Type': 'application/json'
                        },
                        timeout: 250,
                        data: JSON.stringify(data)
                    });
                    return true;
                });
            }
        };
        return{
            link: link,
            scope: false
        };
    });

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
