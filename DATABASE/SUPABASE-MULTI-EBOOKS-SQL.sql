-- ============================================
-- FRENCH CONNEXION - SYSTÈME MULTI-EBOOKS
-- ============================================
-- Ce script crée les tables nécessaires pour gérer plusieurs ebooks
-- Exécuter dans Supabase SQL Editor

-- ============================================
-- TABLE 1: EBOOKS
-- ============================================
-- Stocke tous les ebooks disponibles à l'achat

CREATE TABLE IF NOT EXISTS public.ebooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    short_description TEXT,
    price DECIMAL(10,2) NOT NULL,
    cover_image_url TEXT,
    content_url TEXT,
    chapters JSONB DEFAULT '[]'::jsonb,
    total_chapters INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index pour recherche rapide par slug
CREATE INDEX IF NOT EXISTS idx_ebooks_slug ON public.ebooks(slug);
CREATE INDEX IF NOT EXISTS idx_ebooks_active ON public.ebooks(is_active);

-- ============================================
-- TABLE 2: USER_PURCHASES
-- ============================================
-- Enregistre tous les achats d'ebooks par utilisateur

CREATE TABLE IF NOT EXISTS public.user_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    ebook_id UUID NOT NULL REFERENCES public.ebooks(id) ON DELETE CASCADE,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    price_paid DECIMAL(10,2) NOT NULL,
    payment_intent_id TEXT,
    stripe_session_id TEXT,
    UNIQUE(user_id, ebook_id)
);

-- Index pour requêtes rapides
CREATE INDEX IF NOT EXISTS idx_purchases_user ON public.user_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_ebook ON public.user_purchases(ebook_id);
CREATE INDEX IF NOT EXISTS idx_purchases_date ON public.user_purchases(purchased_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Activer RLS sur la table ebooks
ALTER TABLE public.ebooks ENABLE ROW LEVEL SECURITY;

-- Policy : Tout le monde peut voir les ebooks actifs
CREATE POLICY "Anyone can view active ebooks"
    ON public.ebooks
    FOR SELECT
    USING (is_active = true);

-- Activer RLS sur la table user_purchases
ALTER TABLE public.user_purchases ENABLE ROW LEVEL SECURITY;

-- Policy : Les utilisateurs peuvent voir uniquement leurs propres achats
CREATE POLICY "Users can view their own purchases"
    ON public.user_purchases
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy : Le backend peut insérer des achats (via service_role)
CREATE POLICY "Service role can insert purchases"
    ON public.user_purchases
    FOR INSERT
    WITH CHECK (true);

-- ============================================
-- FONCTION : Vérifier si un utilisateur a acheté un ebook
-- ============================================

CREATE OR REPLACE FUNCTION public.user_owns_ebook(
    p_user_id UUID,
    p_ebook_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.user_purchases
        WHERE user_id = p_user_id
        AND ebook_id = p_ebook_id
    );
END;
$$;

-- ============================================
-- INSERTION DES DONNÉES INITIALES
-- ============================================

-- Insérer French Connexion comme premier ebook
INSERT INTO public.ebooks (
    id,
    title,
    slug,
    description,
    short_description,
    price,
    cover_image_url,
    total_chapters
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'French Connexion™',
    'french-connexion',
    'Le processus complet en 9 étapes pour passer de l''idée à l''action. Les 20 questions diagnostiques qui changent tout. Le défi 7 jours pour lancer immédiatement.',
    '1% Agissent. 99% Rêvent.',
    19.99,
    '/images/french-connexion-cover.jpg',
    13
) ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    price = EXCLUDED.price;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ebooks_updated_at
    BEFORE UPDATE ON public.ebooks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- MIGRATION DES DONNÉES EXISTANTES (OPTIONNEL)
-- ============================================

-- Si vous avez déjà des utilisateurs qui ont acheté French Connexion
-- (via le champ has_paid = true dans profiles), migrez-les :

INSERT INTO public.user_purchases (user_id, ebook_id, price_paid, purchased_at)
SELECT
    id as user_id,
    '00000000-0000-0000-0000-000000000001' as ebook_id,
    19.99 as price_paid,
    created_at as purchased_at
FROM auth.users
WHERE id IN (
    SELECT user_id
    FROM public.profiles
    WHERE has_paid = true
)
ON CONFLICT (user_id, ebook_id) DO NOTHING;

-- ============================================
-- VUES UTILES
-- ============================================

-- Vue : Statistiques par ebook
CREATE OR REPLACE VIEW public.ebook_stats AS
SELECT
    e.id,
    e.title,
    e.slug,
    e.price,
    COUNT(DISTINCT up.user_id) as total_purchases,
    SUM(up.price_paid) as total_revenue,
    MIN(up.purchased_at) as first_purchase,
    MAX(up.purchased_at) as last_purchase
FROM public.ebooks e
LEFT JOIN public.user_purchases up ON e.id = up.ebook_id
GROUP BY e.id, e.title, e.slug, e.price;

-- ============================================
-- VERIFICATION
-- ============================================

-- Vérifier que tout est bien créé
SELECT
    'Tables créées' as status,
    COUNT(*) as ebook_count
FROM public.ebooks;

SELECT
    'Achats enregistrés' as status,
    COUNT(*) as purchase_count
FROM public.user_purchases;

-- ============================================
-- FIN DU SCRIPT
-- ============================================
-- À exécuter dans Supabase > SQL Editor
-- Ensuite, vérifier dans Table Editor que les tables sont bien créées
