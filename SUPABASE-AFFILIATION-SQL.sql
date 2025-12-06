-- =====================================================
-- TABLES D'AFFILIATION POUR SUPABASE
-- =====================================================
-- Ce fichier contient toutes les tables nécessaires pour
-- gérer le système d'affiliation de l'ebook French Connexion
-- =====================================================

-- =====================================================
-- TABLE: affiliates
-- Stocke les informations des affiliés
-- =====================================================
CREATE TABLE IF NOT EXISTS public.affiliates (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    affiliate_code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    commission_rate DECIMAL(5,2) DEFAULT 50.00 NOT NULL,
    status VARCHAR(20) DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'inactive', 'suspended')),
    total_clicks INTEGER DEFAULT 0 NOT NULL,
    total_sales INTEGER DEFAULT 0 NOT NULL,
    total_commission DECIMAL(10,2) DEFAULT 0.00 NOT NULL,
    total_paid DECIMAL(10,2) DEFAULT 0.00 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Index pour améliorer les performances
CREATE INDEX idx_affiliates_user_id ON public.affiliates(user_id);
CREATE INDEX idx_affiliates_code ON public.affiliates(affiliate_code);
CREATE INDEX idx_affiliates_status ON public.affiliates(status);

-- Commentaires
COMMENT ON TABLE public.affiliates IS 'Table principale des affiliés';
COMMENT ON COLUMN public.affiliates.commission_rate IS 'Taux de commission en pourcentage (ex: 50.00 = 50%)';
COMMENT ON COLUMN public.affiliates.status IS 'Statut de l''affilié: active, inactive, suspended';

-- =====================================================
-- TABLE: affiliate_sales
-- Stocke toutes les ventes réalisées par les affiliés
-- =====================================================
CREATE TABLE IF NOT EXISTS public.affiliate_sales (
    id BIGSERIAL PRIMARY KEY,
    affiliate_id BIGINT NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
    buyer_email VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    commission DECIMAL(10,2) NOT NULL,
    stripe_payment_id VARCHAR(255) UNIQUE,
    status VARCHAR(20) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'confirmed', 'paid', 'cancelled')),
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Index pour améliorer les performances
CREATE INDEX idx_affiliate_sales_affiliate_id ON public.affiliate_sales(affiliate_id);
CREATE INDEX idx_affiliate_sales_status ON public.affiliate_sales(status);
CREATE INDEX idx_affiliate_sales_stripe_id ON public.affiliate_sales(stripe_payment_id);
CREATE INDEX idx_affiliate_sales_created_at ON public.affiliate_sales(created_at);

-- Commentaires
COMMENT ON TABLE public.affiliate_sales IS 'Toutes les ventes générées par les affiliés';
COMMENT ON COLUMN public.affiliate_sales.status IS 'Statut de la vente: pending, confirmed, paid, cancelled';
COMMENT ON COLUMN public.affiliate_sales.paid_at IS 'Date de paiement de la commission à l''affilié';

-- =====================================================
-- TABLE: affiliate_clicks
-- Stocke tous les clics sur les liens d'affiliation
-- =====================================================
CREATE TABLE IF NOT EXISTS public.affiliate_clicks (
    id BIGSERIAL PRIMARY KEY,
    affiliate_id BIGINT NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    referrer VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Index pour améliorer les performances
CREATE INDEX idx_affiliate_clicks_affiliate_id ON public.affiliate_clicks(affiliate_id);
CREATE INDEX idx_affiliate_clicks_created_at ON public.affiliate_clicks(created_at);
CREATE INDEX idx_affiliate_clicks_ip ON public.affiliate_clicks(ip_address);

-- Commentaires
COMMENT ON TABLE public.affiliate_clicks IS 'Tracking des clics sur les liens d''affiliation';

-- =====================================================
-- FUNCTION: generate_affiliate_code
-- Génère un code d'affiliation unique de 8 caractères
-- =====================================================
CREATE OR REPLACE FUNCTION public.generate_affiliate_code()
RETURNS VARCHAR(20) AS $$
DECLARE
    new_code VARCHAR(20);
    code_exists BOOLEAN;
    chars VARCHAR(36) := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    i INTEGER;
BEGIN
    LOOP
        -- Générer un code de 8 caractères aléatoires
        new_code := '';
        FOR i IN 1..8 LOOP
            new_code := new_code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
        END LOOP;

        -- Vérifier si le code existe déjà
        SELECT EXISTS(SELECT 1 FROM public.affiliates WHERE affiliate_code = new_code) INTO code_exists;

        -- Si le code n'existe pas, le retourner
        IF NOT code_exists THEN
            RETURN new_code;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Commentaires
COMMENT ON FUNCTION public.generate_affiliate_code IS 'Génère un code d''affiliation unique de 8 caractères (A-Z, 0-9)';

-- =====================================================
-- TRIGGER FUNCTION: update_affiliate_clicks_stats
-- Met à jour le compteur de clics de l'affilié
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_affiliate_clicks_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Incrémenter le compteur de clics
    UPDATE public.affiliates
    SET total_clicks = total_clicks + 1,
        updated_at = NOW()
    WHERE id = NEW.affiliate_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Création du trigger
DROP TRIGGER IF EXISTS trigger_update_affiliate_clicks ON public.affiliate_clicks;
CREATE TRIGGER trigger_update_affiliate_clicks
    AFTER INSERT ON public.affiliate_clicks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_affiliate_clicks_stats();

-- Commentaires
COMMENT ON FUNCTION public.update_affiliate_clicks_stats IS 'Met à jour automatiquement total_clicks quand un nouveau clic est enregistré';

-- =====================================================
-- TRIGGER FUNCTION: update_affiliate_sales_stats
-- Met à jour les stats de ventes de l'affilié
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_affiliate_sales_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Si la vente passe à confirmed, mettre à jour les stats
    IF NEW.status = 'confirmed' AND (OLD IS NULL OR OLD.status != 'confirmed') THEN
        UPDATE public.affiliates
        SET total_sales = total_sales + 1,
            total_commission = total_commission + NEW.commission,
            updated_at = NOW()
        WHERE id = NEW.affiliate_id;
    END IF;

    -- Si la vente passe à cancelled, décrémenter les stats (si elle était confirmed avant)
    IF NEW.status = 'cancelled' AND OLD.status = 'confirmed' THEN
        UPDATE public.affiliates
        SET total_sales = total_sales - 1,
            total_commission = total_commission - NEW.commission,
            updated_at = NOW()
        WHERE id = NEW.affiliate_id;
    END IF;

    -- Si la commission est payée, mettre à jour total_paid
    IF NEW.status = 'paid' AND (OLD IS NULL OR OLD.status != 'paid') THEN
        UPDATE public.affiliates
        SET total_paid = total_paid + NEW.commission,
            updated_at = NOW()
        WHERE id = NEW.affiliate_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Création du trigger
DROP TRIGGER IF EXISTS trigger_update_affiliate_sales ON public.affiliate_sales;
CREATE TRIGGER trigger_update_affiliate_sales
    AFTER INSERT OR UPDATE ON public.affiliate_sales
    FOR EACH ROW
    EXECUTE FUNCTION public.update_affiliate_sales_stats();

-- Commentaires
COMMENT ON FUNCTION public.update_affiliate_sales_stats IS 'Met à jour automatiquement les stats (total_sales, total_commission, total_paid) selon le statut de la vente';

-- =====================================================
-- TRIGGER FUNCTION: update_updated_at
-- Met à jour automatiquement le champ updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Création du trigger pour affiliates
DROP TRIGGER IF EXISTS trigger_affiliates_updated_at ON public.affiliates;
CREATE TRIGGER trigger_affiliates_updated_at
    BEFORE UPDATE ON public.affiliates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Commentaires
COMMENT ON FUNCTION public.update_updated_at_column IS 'Met à jour automatiquement updated_at lors d''une modification';

-- =====================================================
-- RLS (Row Level Security) - À configurer selon vos besoins
-- =====================================================
-- Activer RLS sur toutes les tables
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- Politique par défaut: les affiliés peuvent voir uniquement leurs propres données
CREATE POLICY "Affiliates can view own data" ON public.affiliates
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Affiliates can view own sales" ON public.affiliate_sales
    FOR SELECT
    USING (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));

CREATE POLICY "Affiliates can view own clicks" ON public.affiliate_clicks
    FOR SELECT
    USING (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));

-- Les admins peuvent tout voir (à adapter selon votre système de rôles)
-- CREATE POLICY "Admins can view all" ON public.affiliates
--     FOR ALL
--     USING (auth.jwt() ->> 'role' = 'admin');

-- =====================================================
-- DONNÉES DE TEST (optionnel - à supprimer en production)
-- =====================================================
-- Exemple d'insertion d'un affilié de test
-- INSERT INTO public.affiliates (user_id, affiliate_code, name, email, commission_rate)
-- VALUES (
--     '00000000-0000-0000-0000-000000000000', -- Remplacer par un vrai UUID
--     'TEST1234',
--     'Test Affiliate',
--     'test@example.com',
--     50.00
-- );

-- =====================================================
-- VUES UTILES (optionnel)
-- =====================================================

-- Vue pour les statistiques détaillées des affiliés
CREATE OR REPLACE VIEW public.affiliate_stats AS
SELECT
    a.id,
    a.affiliate_code,
    a.name,
    a.email,
    a.status,
    a.commission_rate,
    a.total_clicks,
    a.total_sales,
    a.total_commission,
    a.total_paid,
    a.total_commission - a.total_paid AS pending_payment,
    CASE
        WHEN a.total_clicks > 0 THEN ROUND((a.total_sales::DECIMAL / a.total_clicks) * 100, 2)
        ELSE 0
    END AS conversion_rate,
    a.created_at,
    a.updated_at
FROM public.affiliates a;

COMMENT ON VIEW public.affiliate_stats IS 'Vue avec statistiques calculées pour chaque affilié';

-- =====================================================
-- FIN DU FICHIER
-- =====================================================
