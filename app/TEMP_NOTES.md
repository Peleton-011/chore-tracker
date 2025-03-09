### General

* Standardize style and make it more consistent, both in design and in implementation

#### Forms

state should be consolidated, eg: household data is held in a singular piece of state with different internal properties. 

This is to keep the components as lean as possible, since their complexity makes them especially susceptible to bloat.

This also results in coherent objects that are much more versatile and useful

### TO-DO:


#### Logic 

##### Recurring Tasks 

*  The automatic placeholder generator should never generate overdue tasks ⇨ Begin generation on new Date() at the earliest. 

##### Tasks Component

* Add a toggle/ filter to show only complete tasks, only pending tasks etc... Especially a way to see and interact with (edit, delete ...) recurring task definitions.

#### Forms

* Connect the forms to the backend proper

* Extract the create and update functions inside the CreateHousehold and move over to a more similar system to CreateTask. This is to ensure separation of concerns

* (!! Optional, think about whether or not this should be added !!) Add input option to select a household inside CreateTask if no householdId is provided. This should be a dropdown with the user's households as options as well as a "Private" or "None" option. This is to allow the creation of household tasks from outside the specific household page.

* Fix the Household icon picker & display

    ##### API Logic & Such
    Upon submitting a task, it should follow this very roughly described pipeline:

    | !hhId  | "      | hhId      | "          | "      | "   |
    |--------|--------|-----------|------------|--------|-----|
    | !rec   | rec    | !rec      | rec        | !rec   | rec |
    | ST, SU | Rec SU | ST, SC, * | Rec, SC, * | MU, ** | *, *** |

    Where: 
    
    + hhId: Whether or not a household Id is provided
    + rec: Whether or not a recurrence definition is provided
    + ST: Single-Time Task, once completed it's gone
    + SU: Single User Task. A private task.
    + Rec: Recurring Task.
    + SC: Single/Shared Completion. A shared task that several people can acces but whose "state" is shared across those users.
    +  MU: Multi-User Task. A task that several users individually get "copies" of. Markedly not shared.
    + \* :  This generated task should not be in any specific user's personal tasks. Only in the relevant household. If it is recurring it will only generate placeholders inside the household unless there is a rotation schedule specifying how the task should be added to different users. 
    + \** : This generated task should be added to all users individually & not to the household (though it should have a reference to it)
    + \*** : This task should make use of a full rotation schedule to handle whatever kind of a recurrence it needs.


#### Pages

##### /households/[id]

* Use modal/ hot toast to notify of successful invite link/code copying 