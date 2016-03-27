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

(function() {
    'use strict';
(function AddLibraries(){
    var script = document.createElement("script");
    script.setAttribute("src", "https://ajax.googleapis.com/ajax/libs/angularjs/1.5.0/angular.min.js");
    document.body.appendChild(script);
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
            //All the HTML that needs to be inserted
            $('body').prepend(
            '<div id="userStatuses" title="{{config.statusConfig[statuses.selectedStatus].name}} Timers" style="overflow-y:auto;">'+
                '<table id="statusTable" class="table table-bordered table-condensed" style="border-radius: 0px; text-align:center;">'+
                    '<thead>'+
                        '<tr>'+
                            '<th style="border-radius: 0px; font-size: 110%; font-weight:600; text-align: center;">Name</th>'+
                            '<th style="border-radius: 0px; font-size: 110%; font-weight:600; text-align: center;">Time (s)</th>'+
                        '</tr>'+
                    '</thead>'+
                    '<tbody>'+
                        '<tr style="background: hsl({{user.hue}}, 100%, {{user.level}})" ng-repeat="user in statuses.usersHash | toArray | filter:{currentStatus: config.statusConfig[statuses.selectedStatus].id} : statuses.statusList[statuses.selectedStatus].exactMatch | filter: \'!\' + hideMatchingText | orderBy: ' + "'" + 'timeInStatus' + "'" +':true">'+
                            '<td style="text-align: center; border-color:#dddddd; padding-top: 2px !important; padding-bottom:2px !important; height: auto;">{{user.name}}</td>'+
                            '<td style="text-align: center; border-color:#dddddd; padding-top: 2px !important; padding-bottom:2px !important; height: auto;">{{user.timeInStatus | date: "H:mm:ss": "UTC"}}</td>'+
                        '</tr>'+
                    '</tbody>'+
                '</table></div>' );
                $('#userStatuses').dialog();
                $('#userStatuses').parent().attr("ng-app", "statusesApp");
                $('#userStatuses').parent().attr("ng-controller", "statusesAppController");
                $('#userStatuses').parent().append(
                    '<div style="color: white;" id="settingsAccordian">'+
                        '<h3 style="border: 0px; text-align:center;">Settings</h3>'+
                        '<div style="background: #303941;">'+
                            '<select ng-model="statuses.selectedStatus">'+
                                '<option id="{{status.id}}" value="{{status.id}}" ng-repeat="status in statuses.statusArray | unique: \'name\'">{{status.name}}</option>'+
                            '</select>'+
                            '<label for="hideMatching">Hide Matching:</label>'+
                            '<input type="text" ng-model="hideMatchingText" id="hideMatching" style="width: 40%; font-size: 1em; display:inline-block;">'+
                            '<label for="hideMatching">Highest {{statuses.statusList[statuses.selectedStatus].name}} Permitted (s)</label>'+
                            '<input type="number" ng-model="statuses.statusList[statuses.selectedStatus].maxTime" id="hideMatching" style="width: 40%; font-size: 1em;">'+
                        '</div>'+
                    '</div>');
                $('#settingsAccordian').accordion({
                    collapsible: true,
                    active: false,
                    icons: false
                });
    var statusesApp = angular.module("statusesApp", []);
    statusesApp.factory('Statuses', function(){
        var statuses = {};
        statuses.selectedStatus = 'after_call_work';
        statuses.statusArray = [];
        statuses.statusHash = {};

        statuses.setStatuses = function(statusesObject, statusesConfig){
            for(var status in statusesObject){
                if(statusesConfig.hasOwnProperty(status)){
                    statuses.statusArray.push(statusesConfig[status]);
                    statuses.statusHash[status] = statusesConfig[status];
                }
                else{
                    statuses.statusArray.push({name: statusesObject[status], id: status, color: false, exactMatch: true, maxTime: -1});
                    statuses.statusHash[status] = statusesObject[status];
                }
            }
        };
        statuses.usersHash = {};


        statuses.ProcessStatusChange = function(requestObject){
            //If user exists in hash already
            if(typeof statuses.usersHash[requestObject._id] !== 'undefined'){
                statuses.usersHash[requestObject._id].currentStatus = requestObject.status;
                statuses.usersHash[requestObject._id].timeChanged = requestObject.updated_at;
                statuses.usersHash[requestObject._id].timeInStatus = 0;
            }
            //If user does not exist in hash, add them and process approprietly
            else{
                var newUser = {
                    id: requestObject._id,
                    name: requestObject.name,
                    currentStatus: requestObject.status,
                    timeChanged: requestObject.updated_at,
                    timeInStatus:0,
                    hue: 110,
                    level: '88%'
                };
                statuses.usersHash[requestObject._id] = newUser;
                console.info("Added new user to hash");
                console.info(statuses.usersHash);
            }
        };

        statuses.CalculateStatusTimes = function(statusConfig){
            for(var user in statuses.usersHash){
            	if(statuses.usersHash.hasOwnProperty(user)){
	                var startMs = new Date(statuses.usersHash[user].timeChanged).getTime();
	                var nowMs = new Date().getTime();
	                var diff = (nowMs - startMs);
	                var hue = 110;
	                var level = statusConfig[statuses.usersHash[user].currentStatus].color?'88%':'100%';
	                try{
	                hue = Math.max(110 - Math.abs((diff/1000*(110/statusConfig[statuses.usersHash[user].currentStatus].maxTime))), 0);
	                }
	                catch(e){
	                    console.error("Unable To find status's maxTime: " + statuses.usersHash[user].currentStatus, e);
	                }

	                statuses.usersHash[user].timeInStatus = diff;
	                statuses.usersHash[user].hue = hue;
	                statuses.usersHash[user].level = level;
            	}
            }
        };
        return statuses;
    });

    //Angular controller for the app
    statusesApp.controller("statusesAppController", ["$scope", "Statuses", function($scope, Statuses){
        $scope.statuses = Statuses;

        $scope.config = config;
        $scope.statuses.setStatuses(App.Vars.company.attributes.custom_status, $scope.config.statusConfig);

        $scope.hideMatchingText = "Nothing";
        //The handler for AJAX requests
        $scope.SetupAJAXHandler = function(open) {
            console.info("inside request event handler");
            XMLHttpRequest.prototype.open = function() {
                this.addEventListener("readystatechange", function() {
                    if(this.responseText != null)
                    {
                        if(typeof this.responseText != 'undefined' && this.responseText != ""){
                            var responseObject = {};
                            try{
                                responseObject = JSON.parse(this.responseText);
                            }
                            catch(e) {
                                console.error("JSON Parse Failed");
                           }
                            if(typeof responseObject._id != 'undefined'){
                                if(typeof responseObject.status != 'undefined'){
                                    $scope.statuses.ProcessStatusChange(responseObject);
                                    console.info("New Valid Request");
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

        $scope.SetupAJAXHandler(XMLHttpRequest.prototype.open);
        $scope.SetupTimer();
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

    angular.bootstrap($('#userStatuses').parent(), ['statusesApp']);
}
})();
