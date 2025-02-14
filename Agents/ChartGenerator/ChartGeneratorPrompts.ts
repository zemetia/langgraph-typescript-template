export const supervisorNodePrompt: string =
"You are a supervisor tasked with managing a conversation between the" +
    " following teams: {team_members}. Given the following user request," +
    " respond with the worker to act next. Each worker will perform a" +
    " task and respond with their results and status. When finished," +
    " respond with FINISH.\n\n" +
    " Select strategically to minimize the number of steps taken.";

export const workerPrompt: string = 
"Given the conversation above, who should act next?" +
" Or should we FINISH? Select one of: {options}";