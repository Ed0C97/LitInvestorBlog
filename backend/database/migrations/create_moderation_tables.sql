-- LitInvestorBlog-backend/database/migrations/create_moderation_tables.sql
-- Tabelle per il sistema di moderazione

-- ✅ Tabella per il log delle azioni di moderazione
CREATE TABLE IF NOT EXISTS main.moderation_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES main.user(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL, -- 'warning', 'ban', 'unban', etc.
    message TEXT NOT NULL,
    admin_id INTEGER NOT NULL REFERENCES main.user(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indici per performance
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES main.user(id),
    CONSTRAINT fk_admin FOREIGN KEY (admin_id) REFERENCES main.user(id)
);

-- Indici per query veloci
CREATE INDEX IF NOT EXISTS idx_moderation_log_user_id ON main.moderation_log(user_id);
CREATE INDEX IF NOT EXISTS idx_moderation_log_action_type ON main.moderation_log(action_type);
CREATE INDEX IF NOT EXISTS idx_moderation_log_created_at ON main.moderation_log(created_at DESC);

-- ✅ Tabella per le segnalazioni dei commenti (se non esiste già)
CREATE TABLE IF NOT EXISTS main.comment_report (
    id SERIAL PRIMARY KEY,
    comment_id INTEGER NOT NULL REFERENCES main.comment(id) ON DELETE CASCADE,
    reporter_id INTEGER REFERENCES main.user(id) ON DELETE SET NULL,
    reason VARCHAR(255) NOT NULL,
    additional_info TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'reviewed', 'dismissed', 'actioned'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by INTEGER REFERENCES main.user(id) ON DELETE SET NULL,
    
    -- Previeni segnalazioni duplicate dallo stesso utente
    CONSTRAINT unique_report_per_user UNIQUE (comment_id, reporter_id)
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_comment_report_comment_id ON main.comment_report(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_report_reporter_id ON main.comment_report(reporter_id);
CREATE INDEX IF NOT EXISTS idx_comment_report_status ON main.comment_report(status);
CREATE INDEX IF NOT EXISTS idx_comment_report_created_at ON main.comment_report(created_at DESC);

-- ✅ Aggiungi colonna is_active alla tabella user se non esiste
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'main' 
        AND table_name = 'user' 
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE main.user ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- ✅ Crea indice sulla colonna is_active
CREATE INDEX IF NOT EXISTS idx_user_is_active ON main.user(is_active);

-- ✅ Vista utile per statistiche di moderazione
CREATE OR REPLACE VIEW main.moderation_stats AS
SELECT 
    u.id as user_id,
    u.username,
    u.email,
    u.role,
    u.is_active,
    COUNT(DISTINCT c.id) as total_comments,
    COUNT(DISTINCT cr.id) as total_reports,
    COUNT(DISTINCT CASE WHEN ml.action_type = 'warning' THEN ml.id END) as total_warnings,
    COUNT(DISTINCT CASE WHEN ml.action_type = 'ban' THEN ml.id END) as total_bans,
    MAX(ml.created_at) as last_moderation_action
FROM main.user u
LEFT JOIN main.comment c ON c.user_id = u.id
LEFT JOIN main.comment_report cr ON cr.comment_id = c.id
LEFT JOIN main.moderation_log ml ON ml.user_id = u.id
GROUP BY u.id, u.username, u.email, u.role, u.is_active;

-- ✅ Commenti
COMMENT ON TABLE main.moderation_log IS 'Log di tutte le azioni di moderazione (warning, ban, etc.)';
COMMENT ON TABLE main.comment_report IS 'Segnalazioni dei commenti da parte degli utenti';
COMMENT ON COLUMN main.user.is_active IS 'Indica se l''account è attivo (false = bannato)';
COMMENT ON VIEW main.moderation_stats IS 'Vista aggregata delle statistiche di moderazione per utente';
