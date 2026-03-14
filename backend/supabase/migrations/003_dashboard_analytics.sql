-- ─── AI ACTIVITY LOG ────────────────────────────────────────────────────────
CREATE TABLE ai_activity_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_id   UUID REFERENCES repositories(id) ON DELETE CASCADE,
  repo_name       TEXT NOT NULL,
  event_type      TEXT NOT NULL CHECK (event_type IN ('scan_started', 'scan_completed', 'issue_detected', 'pr_created', 'repo_connected')),
  details         JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON ai_activity_log (repository_id);
CREATE INDEX ON ai_activity_log (created_at DESC);

ALTER TABLE ai_activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_activity_log_via_repo" ON ai_activity_log FOR ALL USING (
  EXISTS (
    SELECT 1 FROM repositories r
    WHERE r.id = ai_activity_log.repository_id
    AND r.user_id = (SELECT id FROM users WHERE id::text = auth.uid()::text)
  )
);

-- ─── DASHBOARD ANALYTICS FUNCTIONS ────────────────────────────────────────

-- Function to get overall dashboard analytics for the current user
CREATE OR REPLACE FUNCTION get_dashboard_analytics(p_user_id UUID)
RETURNS TABLE (
  total_repos BIGINT,
  total_stars BIGINT,
  issues_detected BIGINT,
  issues_resolved BIGINT,
  ai_scans_run BIGINT
) LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT r.id) AS total_repos,
    -- We'll sum 'stars' from front-end since GitHub API provides it, or if we have it here we can sum.
    -- Wait, our repositories table doesn't have a stars column! 
    -- The frontend implementation plan says "Fetch analytics from backend endpoint".
    -- Let's add a fake 'stars' or we'll compute it on the frontend by mixing with GitHub API. 
    -- Actually, if stars aren't in the DB, we can return 0 and let the frontend compute `Total Stars` by summing GitHub repos. 
    -- We can change the schema to include `stars Integer default 0` into repositories.
    0::BIGINT AS total_stars,
    
    (SELECT COUNT(i.id) FROM issues i 
     JOIN repositories rp ON rp.id = i.repository_id 
     WHERE rp.user_id = p_user_id) AS issues_detected,
     
    (SELECT COUNT(i.id) FROM issues i 
     JOIN repositories rp ON rp.id = i.repository_id 
     WHERE i.state = 'resolved' AND rp.user_id = p_user_id) AS issues_resolved,
     
    (SELECT COUNT(l.id) FROM ai_activity_log l 
     JOIN repositories rp ON rp.id = l.repository_id 
     WHERE l.event_type = 'scan_completed' AND rp.user_id = p_user_id) AS ai_scans_run
  FROM repositories r
  WHERE r.user_id = p_user_id;
END;
$$;


-- Function to get issue types breakdown for the current user
CREATE OR REPLACE FUNCTION get_issue_types_breakdown(p_user_id UUID)
RETURNS TABLE (
  classification TEXT,
  count BIGINT
) LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT 
    COALESCE(i.classification, 'other') AS classification,
    COUNT(*) AS count
  FROM issues i
  JOIN repositories r ON r.id = i.repository_id
  WHERE r.user_id = p_user_id
  GROUP BY COALESCE(i.classification, 'other')
  ORDER BY count DESC;
$$;
