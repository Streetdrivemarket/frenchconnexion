// ========================================
// 🎮 SYSTÈME DE PROGRESSION GAMIFIÉE
// French Connexion™
// ========================================

class ProgressManager {
    constructor() {
        this.userProgress = null;
        this.chapters = [
            { id: 'intro', name: 'Introduction', icon: '📌' },
            { id: 'chapitre-1', name: 'L\'IDÉE', icon: '💡' },
            { id: 'chapitre-2', name: 'L\'ÉCRIRE', icon: '✍️' },
            { id: 'chapitre-3', name: 'APPRENDRE', icon: '📚' },
            { id: 'chapitre-4', name: 'COMPRENDRE', icon: '🧠' },
            { id: 'chapitre-5', name: 'TES OBJECTIFS', icon: '🎯' },
            { id: 'chapitre-6', name: 'POURQUOI J\'ÉCHOUERAI', icon: '⚠️' },
            { id: 'chapitre-7', name: 'ANALYSER', icon: '🔍' },
            { id: 'chapitre-8', name: 'CRÉER', icon: '🛠️' },
            { id: 'chapitre-9', name: 'DÉVELOPPER', icon: '🚀' },
            { id: 'schema', name: 'LE SCHÉMA', icon: '📊' },
            { id: 'questions', name: '20 QUESTIONS', icon: '🎯' },
            { id: 'revelation', name: 'RÉVÉLATION', icon: '💥' },
            { id: 'conclusion', name: 'CONCLUSION', icon: '🏆' },
            { id: 'message-final', name: 'MESSAGE FINAL', icon: '🔥' }
        ];

        this.badges = {
            'first-steps': { name: '🎯 Premiers Pas', description: '3 chapitres complétés' },
            'midway': { name: '⚡ Mi-Parcours', description: '6 chapitres complétés' },
            'almost-there': { name: '🔥 Presque là', description: '10 chapitres complétés' },
            'completed': { name: '👑 Maîtrise Complète', description: 'Tous les chapitres complétés' }
        };

        this.init();
    }

    async init() {
        console.log('🎮 Initialisation du système de progression...');
        await this.loadProgress();
        this.setupUI();
        this.lockChapters();
        this.addValidationButtons();
    }

    // ========================================
    // 📊 CHARGEMENT DE LA PROGRESSION
    // ========================================
    async loadProgress() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('❌ Pas de token trouvé');
                return;
            }

            const response = await fetch(`${window.API_URL}/progress/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Erreur chargement progression');
            }

            const data = await response.json();
            this.userProgress = data.progress;

            console.log('✅ Progression chargée:', this.userProgress);
        } catch (error) {
            console.error('❌ Erreur loadProgress:', error);
            // Progression par défaut : seule l'intro est déverrouillée
            this.userProgress = {
                unlocked_chapters: ['intro'],
                completion_percentage: 0,
                badges_earned: []
            };
        }
    }

    // ========================================
    // 🔒 VERROUILLAGE DES CHAPITRES
    // ========================================
    lockChapters() {
        const chapterLinks = document.querySelectorAll('.chapter-link');

        chapterLinks.forEach(link => {
            const chapterId = link.getAttribute('data-chapter');
            const isUnlocked = this.isChapterUnlocked(chapterId);

            if (!isUnlocked) {
                // Verrouiller le chapitre
                link.classList.add('locked');
                link.style.opacity = '0.4';
                link.style.cursor = 'not-allowed';

                // Ajouter l'icône cadenas
                const lockIcon = document.createElement('span');
                lockIcon.className = 'lock-icon';
                lockIcon.textContent = '🔒';
                lockIcon.style.marginLeft = 'auto';
                lockIcon.style.fontSize = '14px';
                link.appendChild(lockIcon);

                // Empêcher le clic
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.showLockedMessage(chapterId);
                });
            } else {
                // Déverrouillé
                link.classList.remove('locked');
                link.style.opacity = '1';
                link.style.cursor = 'pointer';
            }
        });
    }

    isChapterUnlocked(chapterId) {
        if (!this.userProgress || !this.userProgress.unlocked_chapters) {
            return chapterId === 'intro'; // Par défaut, seule l'intro
        }

        const unlockedList = Array.isArray(this.userProgress.unlocked_chapters)
            ? this.userProgress.unlocked_chapters
            : JSON.parse(JSON.stringify(this.userProgress.unlocked_chapters || []));

        return unlockedList.includes(chapterId);
    }

    showLockedMessage(chapterId) {
        const chapterName = this.chapters.find(c => c.id === chapterId)?.name || chapterId;

        this.showShockMessage(
            `🔒 CHAPITRE VERROUILLÉ`,
            `Pour déverrouiller <strong>${chapterName}</strong>, tu dois d'abord compléter le chapitre précédent.<br><br>
            <em>Pas de raccourci. Pas de skip. Tu avances étape par étape.</em>`,
            'warning'
        );
    }

    // ========================================
    // ✅ BOUTONS DE VALIDATION
    // ========================================
    addValidationButtons() {
        // Supprimer tous les anciens boutons d'abord
        document.querySelectorAll('.validation-button').forEach(btn => btn.remove());

        const chapters = document.querySelectorAll('.chapter');

        chapters.forEach((chapterEl) => {
            const chapterId = chapterEl.id;

            // Trouver l'index de ce chapitre dans notre tableau
            const currentIndex = this.chapters.findIndex(c => c.id === chapterId);
            if (currentIndex === -1) {
                console.warn(`⚠️ Chapitre ${chapterId} non trouvé dans la liste`);
                return;
            }

            // Vérifier si ce chapitre est déverrouillé
            if (!this.isChapterUnlocked(chapterId)) {
                return;
            }

            // Trouver le chapitre suivant
            const nextChapter = this.chapters[currentIndex + 1];
            if (!nextChapter) {
                console.log(`✅ ${chapterId} est le dernier chapitre, pas de bouton`);
                return;
            }

            // Ne pas ajouter de bouton si le chapitre suivant est déjà déverrouillé
            if (this.isChapterUnlocked(nextChapter.id)) {
                console.log(`✅ ${nextChapter.id} déjà déverrouillé, pas besoin de bouton`);
                return;
            }

            console.log(`🎯 Ajout bouton pour ${chapterId} → ${nextChapter.id}`);

            // Créer le bouton de validation
            const validationBtn = document.createElement('div');
            validationBtn.className = 'validation-button';
            validationBtn.innerHTML = `
                <button class="unlock-btn" data-chapter="${chapterId}" data-next="${nextChapter.id}">
                    ✅ J'ai compris. Déverrouiller le suivant.
                </button>
            `;

            // Ajouter à la fin du chapitre
            chapterEl.appendChild(validationBtn);

            // Event listener
            validationBtn.querySelector('button').addEventListener('click', () => {
                this.unlockNextChapter(chapterId, nextChapter.id);
            });
        });
    }

    // ========================================
    // 🔓 DÉVERROUILLAGE
    // ========================================
    async unlockNextChapter(currentChapterId, nextChapterId) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('❌ Pas de token. Reconnecte-toi.');
                window.location.href = 'login.html';
                return;
            }

            console.log(`🔓 Tentative déverrouillage: ${currentChapterId} → ${nextChapterId}`);
            console.log(`🔑 Token: ${token.substring(0, 20)}...`);
            console.log(`🌐 URL: ${window.API_URL}/progress/unlock`);

            const response = await fetch(`${window.API_URL}/progress/unlock`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ chapter_id: nextChapterId })
            });

            console.log(`📡 Status HTTP: ${response.status}`);

            const data = await response.json();
            console.log(`📊 Réponse API:`, data);

            if (!response.ok) {
                console.error(`❌ HTTP ${response.status}:`, data);
                alert(`❌ Erreur ${response.status}: ${data.error || 'Erreur inconnue'}\n\nDétails: ${JSON.stringify(data)}`);
                return;
            }

            if (!data.success) {
                console.error('❌ Success = false:', data);
                alert(`❌ Échec déverrouillage: ${data.error || 'Erreur inconnue'}`);
                return;
            }

            console.log(`✅ Déverrouillage réussi !`);

            // Mise à jour de la progression locale
            this.userProgress.unlocked_chapters = data.unlocked_chapters;
            this.userProgress.completion_percentage = data.completion_percentage;

            // Animation de déverrouillage
            await this.playUnlockAnimation(nextChapterId, data.shock_message, data.badge_awarded);

            // Rafraîchir l'UI
            this.lockChapters();
            this.addValidationButtons();
            this.updateProgressUI();

        } catch (error) {
            console.error('❌ Exception unlock:', error);
            alert(`❌ Exception: ${error.message}\n\nVoir console F12 pour détails.`);
        }
    }

    async playUnlockAnimation(chapterId, shockMessage, badge) {
        const chapterName = this.chapters.find(c => c.id === chapterId)?.name || chapterId;
        const chapterIcon = this.chapters.find(c => c.id === chapterId)?.icon || '🔓';

        // Message de shock
        this.showShockMessage(
            `${chapterIcon} NOUVEAU CHAPITRE DÉVERROUILLÉ !`,
            `<div style="font-size: 24px; font-weight: 700; margin: 20px 0;">${chapterName}</div>
            <div style="font-size: 16px; margin: 15px 0;">${shockMessage || '✅ Continue comme ça.'}</div>
            ${badge ? `<div style="background: rgba(255, 215, 0, 0.1); padding: 15px; margin-top: 20px; border-radius: 8px;">
                <strong>🏆 BADGE GAGNÉ:</strong> ${badge.name}
            </div>` : ''}`,
            'success'
        );

        // Attendre que l'utilisateur ferme le message
        await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // ========================================
    // 💬 MESSAGES DE SHOCK
    // ========================================
    showShockMessage(title, message, type = 'info') {
        // Créer overlay
        const overlay = document.createElement('div');
        overlay.className = 'shock-overlay';
        overlay.innerHTML = `
            <div class="shock-message ${type}">
                <div class="shock-title">${title}</div>
                <div class="shock-content">${message}</div>
                <button class="shock-close">Continuer</button>
            </div>
        `;

        document.body.appendChild(overlay);

        // Animation d'entrée
        setTimeout(() => {
            overlay.classList.add('active');
        }, 10);

        // Fermer
        overlay.querySelector('.shock-close').addEventListener('click', () => {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 300);
        });
    }

    // ========================================
    // 📊 MISE À JOUR DE L'UI DE PROGRESSION
    // ========================================
    setupUI() {
        // Ajouter la barre de progression dans le dashboard
        const dashboardSection = document.getElementById('dashboard-section');
        if (!dashboardSection) return;

        const progressUI = document.createElement('div');
        progressUI.id = 'gamification-progress';
        progressUI.className = 'gamification-ui';
        progressUI.innerHTML = `
            <div class="progress-card">
                <h3>📊 Ta Progression</h3>
                <div class="progress-bar-container">
                    <div class="progress-bar" id="progress-bar" style="width: ${this.userProgress?.completion_percentage || 0}%"></div>
                </div>
                <div class="progress-text" id="progress-text">${this.userProgress?.completion_percentage || 0}% complété</div>

                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-value" id="unlocked-count">${this.userProgress?.unlocked_chapters?.length || 1}</div>
                        <div class="stat-label">Chapitres déverrouillés</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${this.chapters.length}</div>
                        <div class="stat-label">Total chapitres</div>
                    </div>
                </div>

                <div class="badges-section" id="badges-section">
                    <h4>🏆 Tes Badges</h4>
                    <div class="badges-grid" id="badges-grid"></div>
                </div>
            </div>
        `;

        // Insérer après le welcome-box
        const welcomeBox = dashboardSection.querySelector('.welcome-box');
        if (welcomeBox) {
            welcomeBox.after(progressUI);
        } else {
            dashboardSection.appendChild(progressUI);
        }

        this.updateProgressUI();
    }

    updateProgressUI() {
        const progressBar = document.getElementById('progress-bar');
        const progressText = document.getElementById('progress-text');
        const unlockedCount = document.getElementById('unlocked-count');
        const badgesGrid = document.getElementById('badges-grid');

        if (progressBar) {
            const percentage = this.userProgress?.completion_percentage || 0;
            progressBar.style.width = `${percentage}%`;
            progressText.textContent = `${percentage}% complété`;
        }

        if (unlockedCount) {
            const count = this.userProgress?.unlocked_chapters?.length || 1;
            unlockedCount.textContent = count;
        }

        if (badgesGrid) {
            const earnedBadges = this.userProgress?.badges_earned || [];
            badgesGrid.innerHTML = '';

            Object.entries(this.badges).forEach(([badgeId, badgeInfo]) => {
                const earned = earnedBadges.some(b => b.id === badgeId);
                const badgeEl = document.createElement('div');
                badgeEl.className = `badge-item ${earned ? 'earned' : 'locked'}`;
                badgeEl.innerHTML = `
                    <div class="badge-icon">${earned ? badgeInfo.name.split(' ')[0] : '🔒'}</div>
                    <div class="badge-name">${earned ? badgeInfo.name : '???'}</div>
                    <div class="badge-desc">${earned ? badgeInfo.description : 'Badge verrouillé'}</div>
                `;
                badgesGrid.appendChild(badgeEl);
            });
        }
    }

    // ========================================
    // 🔄 RESET (DEV ONLY)
    // ========================================
    async resetProgress() {
        if (!confirm('⚠️ ATTENTION: Réinitialiser toute ta progression ?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${window.API_URL}/progress/reset`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                location.reload();
            }
        } catch (error) {
            console.error('❌ Erreur reset:', error);
        }
    }
}

// ========================================
// 🚀 INITIALISATION
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    // Attendre que reader.js soit chargé
    setTimeout(() => {
        window.progressManager = new ProgressManager();

        // Exposer reset pour dev
        window.resetProgress = () => window.progressManager.resetProgress();
    }, 1000);
});
