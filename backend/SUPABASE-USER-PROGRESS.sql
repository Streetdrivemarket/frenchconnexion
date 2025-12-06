-- ========================================
-- 🎮 SYSTÈME DE PROGRESSION GAMIFIÉE
-- ========================================
-- Table pour suivre le déverrouillage progressif des chapitres

-- 1️⃣ TABLE PRINCIPALE: user_progress
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Chapitres déverrouillés (JSON array)
    unlocked_chapters JSONB DEFAULT '["chapter-1"]'::jsonb,

    -- Badges gagnés (JSON array)
    badges_earned JSONB DEFAULT '[]'::jsonb,

    -- Pourcentage de complétion (0-100)
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),

    -- Dernier chapitre déverrouillé
    last_chapter_unlocked TEXT DEFAULT 'chapter-1',

    -- Nombre total de chapitres complétés
    chapters_completed INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Contrainte: un seul enregistrement par utilisateur
    UNIQUE(user_id)
);

-- 2️⃣ INDEX pour performances
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_completion ON user_progress(completion_percentage DESC);

-- 3️⃣ FONCTION: Auto-update du timestamp
CREATE OR REPLACE FUNCTION update_user_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4️⃣ TRIGGER: Auto-update
DROP TRIGGER IF EXISTS trigger_update_user_progress_updated_at ON user_progress;
CREATE TRIGGER trigger_update_user_progress_updated_at
    BEFORE UPDATE ON user_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_user_progress_updated_at();

-- 5️⃣ ROW LEVEL SECURITY (RLS)
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Les utilisateurs ne peuvent voir que LEUR progression
DROP POLICY IF EXISTS "Users can view own progress" ON user_progress;
CREATE POLICY "Users can view own progress"
    ON user_progress
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Les utilisateurs peuvent mettre à jour LEUR progression
DROP POLICY IF EXISTS "Users can update own progress" ON user_progress;
CREATE POLICY "Users can update own progress"
    ON user_progress
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy: Création automatique à l'inscription (via backend)
DROP POLICY IF EXISTS "Service role can insert progress" ON user_progress;
CREATE POLICY "Service role can insert progress"
    ON user_progress
    FOR INSERT
    WITH CHECK (true);

-- 6️⃣ FONCTION: Initialiser la progression pour un nouvel utilisateur
CREATE OR REPLACE FUNCTION initialize_user_progress(p_user_id UUID)
RETURNS void AS $$
BEGIN
    INSERT INTO user_progress (user_id, unlocked_chapters, completion_percentage)
    VALUES (
        p_user_id,
        '["chapter-1"]'::jsonb,
        0
    )
    ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7️⃣ FONCTION: Déverrouiller un chapitre
CREATE OR REPLACE FUNCTION unlock_chapter(
    p_user_id UUID,
    p_chapter_id TEXT
)
RETURNS TABLE (
    success BOOLEAN,
    unlocked_chapters JSONB,
    new_percentage INTEGER
) AS $$
DECLARE
    v_unlocked JSONB;
    v_total_chapters INTEGER := 13; -- 13 niveaux au total
    v_percentage INTEGER;
BEGIN
    -- Récupérer les chapitres actuels
    SELECT up.unlocked_chapters INTO v_unlocked
    FROM user_progress up
    WHERE up.user_id = p_user_id;

    -- Si pas de progression, créer
    IF v_unlocked IS NULL THEN
        PERFORM initialize_user_progress(p_user_id);
        v_unlocked := '["chapter-1"]'::jsonb;
    END IF;

    -- Ajouter le nouveau chapitre s'il n'existe pas déjà
    IF NOT v_unlocked ? p_chapter_id THEN
        v_unlocked := v_unlocked || jsonb_build_array(p_chapter_id);
    END IF;

    -- Calculer le pourcentage
    v_percentage := (jsonb_array_length(v_unlocked) * 100) / v_total_chapters;

    -- Mettre à jour
    UPDATE user_progress
    SET
        unlocked_chapters = v_unlocked,
        last_chapter_unlocked = p_chapter_id,
        chapters_completed = jsonb_array_length(v_unlocked),
        completion_percentage = v_percentage
    WHERE user_id = p_user_id;

    -- Retourner le résultat
    RETURN QUERY
    SELECT
        true AS success,
        v_unlocked AS unlocked_chapters,
        v_percentage AS new_percentage;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8️⃣ FONCTION: Ajouter un badge
CREATE OR REPLACE FUNCTION add_badge(
    p_user_id UUID,
    p_badge_id TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_badges JSONB;
BEGIN
    -- Récupérer les badges actuels
    SELECT badges_earned INTO v_badges
    FROM user_progress
    WHERE user_id = p_user_id;

    -- Si NULL, initialiser
    IF v_badges IS NULL THEN
        v_badges := '[]'::jsonb;
    END IF;

    -- Ajouter le badge s'il n'existe pas
    IF NOT v_badges ? p_badge_id THEN
        v_badges := v_badges || jsonb_build_array(p_badge_id);
    END IF;

    -- Mettre à jour
    UPDATE user_progress
    SET badges_earned = v_badges
    WHERE user_id = p_user_id;

    RETURN v_badges;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- ✅ SCRIPT TERMINÉ
-- ========================================

-- Pour tester:
-- SELECT initialize_user_progress('user-uuid-here');
-- SELECT * FROM unlock_chapter('user-uuid-here', 'chapter-2');
-- SELECT * FROM add_badge('user-uuid-here', 'first-chapter-completed');
