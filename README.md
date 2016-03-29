# TalkDesk Real Time Pause States

This project aims to supplement some of the shortcomings of TalkDesk, such as displaying real time status timers or changing users statuses to offline when they close their browser.

**Using:** Just copy/paste the UserScript.js contents into your chrome console. Alternatively you can paste it into a TamperMonkey script and it will run automatically run whenever you navigate to TalkDesk.

##Features

**Display:**
* Displays real time status timers
* Provides coloring to easily identify outliers and individuals over allotted pause state times
* Can be resized, moved, collapsed, or minimized

**Configuration:**
* Can filter your view based on an exclusionary filter that allows multiple OR like strings
* Can turn coloring off/on on a per status basis *(Implemented, but not configurable yet)*
* Can configure how the coloring is applied based on the time in a pause state
* Can group certain statuses by way of fuzzy filtering. ie. Combining `Break 1`, `Break 2`, `Break 3` into a single `Break` selection *(Implemented, but not configurable yet)*

**New Behavior:**
* When TalkDesk is closed, it will put the user's status into `Offline`. *(Not configurable yet)*
* Can change the status of users right from the widget instead of having to navigating to the admin panel *(Not yet implemented)*

#### Views
If the user has access to the TalkDesk admin panel, they will be able to view the pause state of any user under your organization's account, they will also be able to filter their view as well as switch their view between any of the pause states created for their organizations account.

If the user does not have admin panel access, they will only be able to see their own pause state and the time they have been in that state.


#### Filtering
To filter out values, click on settings and go to the "Hide Matching" box. Type in anything you want filtered in there. 

To filter multiple values, deliminate your text with a `|`. ie. `name1 | name2`
