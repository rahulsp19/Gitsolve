-- Enable Realtime for live agent step updates
ALTER PUBLICATION supabase_realtime ADD TABLE agent_steps;
ALTER PUBLICATION supabase_realtime ADD TABLE agent_runs;
