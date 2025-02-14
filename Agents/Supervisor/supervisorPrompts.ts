const researchTeamSupervisorPrompt = "You are a supervisor tasked with managing a conversation between the" +
" following workers:  {team_members}. Given the following user request," +
" respond with the worker to act next. Each worker will perform a" +
" task and respond with their results and status. When finished," +
" respond with FINISH.\n\n" +
" Select strategically to minimize the number of steps taken.";

const docWritingSupervisorPrompt = "You are a supervisor tasked with managing a conversation between the" +
" following workers:  {team_members}. Given the following user request," +
" respond with the worker to act next. Each worker will perform a" +
" task and respond with their results and status. When finished," +
" respond with FINISH.\n\n" +
" Select strategically to minimize the number of steps taken.";

export { researchTeamSupervisorPrompt, docWritingSupervisorPrompt}