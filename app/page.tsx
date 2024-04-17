import init from "./api/tasks/route";
import Tasks from "./components/Tasks/Tasks";

export default function Home() {

    init();
	return (
		<>
			<Tasks />
		</>
	);
}
