import Task, { ITaskDocument } from "./Task";
import User, {IUserDocument} from "./User";
import Household, {IHouseholdDocument} from "./Household";
import TaskTrade, { ITaskTradeDocument } from "./TaskTrade";
import TaskRotation, { ITaskRotationDocument } from "./TaskRotation";
import RecurringTask, { IRecurringTaskDocument } from "./RecurringTask";
import Invite, { IInviteDocument } from "./Invite";

import { Model } from "mongoose";

export interface Models {
    Task: Model<ITaskDocument>;
    User: Model<IUserDocument>;
    Household: Model<IHouseholdDocument>;
    TaskTrade: Model<ITaskTradeDocument>;
    TaskRotation: Model<ITaskRotationDocument>;
    RecurringTask: Model<IRecurringTaskDocument>;
    Invite: Model<IInviteDocument>;
}

const models: Models = {
	Task,
	User,
	Household,
	TaskTrade,
	TaskRotation,
	RecurringTask,
	Invite,
};

export default models
