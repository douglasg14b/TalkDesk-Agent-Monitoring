# TalkDesk Agent Monitoring

This project aims to supplement some of the shortcomings of TalkDesk, such as displaying real time status timers or changing users statuses to offline when they close their browser.

**Using:** Just copy/paste the UserScript.js contents into your chrome console. Alternatively you can paste it into a TamperMonkey script and it will automatically run whenever you navigate to TalkDesk.

![image](https://user-images.githubusercontent.com/1400380/103045464-6ed77b00-4539-11eb-95a5-77cb1eab6aca.png)
![image](https://user-images.githubusercontent.com/1400380/103045469-73039880-4539-11eb-91cf-90263580acc4.png)


## Features

**Display:**
* Displays real time status timers
* Provides coloring to easily identify outliers and individuals over allotted pause state times
* Can be resized, moved, collapsed, or minimized

**Configuration:**
* Can filter your view based on an exclusionary filter that allows multiple OR like strings
* Can turn coloring off/on on a per status basis
* Can configure how the coloring is applied based on the time in a pause state
* Can assign statuses to group so they are combined under a single name. ie. Combining `Break 1`, `Break 2`, `Break 3` into a single `Break` selection
* Config is stored locally and will apply automatically when this script runs again on TalkDesk
* Config data is shareable with other individuals

**New Behavior:**
* When TalkDesk is closed, it will put the user's status into `Offline`. This is toggleable.
* Can change the status of users right from the widget instead of having to navigating to the admin panel

#### Views
If the user has access to the TalkDesk admin panel, they will be able to view the pause state of any user under your organization's account, they will also be able to filter their view as well as switch their view between any of the pause states created for their organizations account.

If the user does not have admin panel access, they will only be able to see their own pause state and the time they have been in that state. (Untested after recent changes)


#### Filtering
To filter out values, click on settings and go to the "Hide Matching" box. Type in anything you want filtered in there. 

To filter multiple values, deliminate your text with a `|`. ie. `name1 | name2`

#### Grouping Statuses
You can combine several statuses into a single selection. Such as combining 'Break 1', 'Break 2', and 'Break 3' into a single 'Break' selection that will display all users under either of those three statuses.

To do this, check the `Custom Grouping` checkbox on the statuses you wish to group together. In each of the statuses you wish to group, type in the name that you wish to group them by in the `Group Name` text box.

#### Sharing Using and Clearing Config/Settings
You can share your configuration with other users to make it easy to use the script across multiple devices. In the settings/config slide out, at the bottom there is a `Copy/Paste Config` button. If you click this button, you will see a prompt popup containing a compressed config string. To share, just copy it and send it to whomever. To use someone elses config, paste their config in the prompt to replace the existing one. To erase your config, type `{}`.
