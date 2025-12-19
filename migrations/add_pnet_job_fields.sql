-- Add PNET integration fields to jobs table
ALTER TABLE jobs ADD COLUMN pnet_job_id TEXT;
ALTER TABLE jobs ADD COLUMN pnet_job_url TEXT;
ALTER TABLE jobs ADD COLUMN pnet_posted_at DATETIME;
ALTER TABLE jobs ADD COLUMN pnet_status TEXT; -- 'posted', 'closed', 'error'

-- Index for faster PNET job lookups
CREATE INDEX IF NOT EXISTS idx_jobs_pnet_job_id ON jobs(pnet_job_id);
