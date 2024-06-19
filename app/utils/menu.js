import { list, calendar, users, gear } from "./Icons";

const menu = [
  {
    id: 1,
    title: "All Tasks",
    icon: list,
    link: "/",
  },
  {
    id: 2,
    title: "Important!",
    icon: calendar,
    link: "/important",
  },
  {
    id: 3,
    title: "Completed!",
    icon: users,
    link: "/completed",
  },
  {
    id: 4,
    title: "Do It Now",
    icon: gear,
    link: "/incomplete",
  },
];

export default menu;