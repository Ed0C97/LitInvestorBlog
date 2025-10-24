-- Migration: Create comment_report table
-- Date: 2025-01-20

CREATE TABLE IF NOT EXISTS comment_report (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    comment_id INTEGER NOT NULL,
    reporter_id INTEGER NOT NULL,
    reason VARCHAR(100) NOT NULL,
    additional_info TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (comment_id) REFERENCES comment(id) ON DELETE CASCADE,
    FOREIGN KEY (reporter_id) REFERENCES user(id) ON DELETE CASCADE,
    CONSTRAINT unique_comment_report UNIQUE (comment_id, reporter_id)
);

-- Index per migliorare performance
CREATE INDEX IF NOT EXISTS idx_comment_report_comment_id ON comment_report(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_report_reporter_id ON comment_report(reporter_id);
CREATE INDEX IF NOT EXISTS idx_comment_report_status ON comment_report(status);
