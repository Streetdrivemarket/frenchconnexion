// Script pour le lecteur d'ebook avec protections

// ==========================================
// PROTECTION CONTRE LES SCREENSHOTS
// ==========================================

const screenshotOverlay = document.getElementById('screenshot-overlay');
let isBlurred = false;

// Détecter la touche Print Screen (difficile mais on essaie)
document.addEventListener('keyup', (e) => {
    // Print Screen, Cmd+Shift+3/4 (Mac), Windows+Shift+S
    if (e.key === 'PrintScreen' ||
        (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4')) ||
        (e.key === 's' && e.shiftKey && (e.metaKey || e.ctrlKey))) {
        showScreenshotWarning();
    }
});

// Détecter quand la fenêtre perd le focus (possible capture)
let blurTimeout;
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        blurTimeout = setTimeout(() => {
            showScreenshotWarning();
        }, 100);
    } else {
        clearTimeout(blurTimeout);
    }
});

// Détecter les outils de développement (F12, Ctrl+Shift+I, etc.)
document.addEventListener('keydown', (e) => {
    if (e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'J') ||
        (e.ctrlKey && e.key === 'U')) {
        e.preventDefault();
        showScreenshotWarning();
        return false;
    }
});

// Bloquer le clic droit
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    showScreenshotWarning();
    return false;
});

// Fonction pour afficher l'avertissement
function showScreenshotWarning() {
    if (screenshotOverlay && !isBlurred) {
        screenshotOverlay.classList.add('show');
        isBlurred = true;

        setTimeout(() => {
            screenshotOverlay.classList.remove('show');
            isBlurred = false;
        }, 3000);
    }
}

// Protection contre la copie du texte
document.addEventListener('copy', (e) => {
    e.preventDefault();
    showScreenshotWarning();
    return false;
});

// Détecter l'ouverture de DevTools par la taille de la fenêtre
let devtoolsOpen = false;
const threshold = 160;

setInterval(() => {
    if (window.outerHeight - window.innerHeight > threshold ||
        window.outerWidth - window.innerWidth > threshold) {
        if (!devtoolsOpen) {
            devtoolsOpen = true;
            showScreenshotWarning();
        }
    } else {
        devtoolsOpen = false;
    }
}, 1000);

document.addEventListener('DOMContentLoaded', async () => {
    // Vérifier l'authentification
    if (!requireAuth()) return;

    const user = getUser();

    // Vérifier l'accès payant
    if (!user.has_paid) {
        alert('Tu dois acheter l\'ebook pour y accéder.');
        window.location.href = 'payment.html';
        return;
    }

    // Vérifier l'accès via l'API
    try {
        await apiRequest('/reader/access');
    } catch (error) {
        alert('Accès refusé. Vérifie ton paiement.');
        window.location.href = 'payment.html';
        return;
    }

    // Afficher l'email de l'utilisateur dans le header
    document.getElementById('user-email').textContent = user.email;

    // Ajouter le filigrane avec l'email
    const watermark = document.getElementById('watermark');
    if (watermark) {
        watermark.textContent = `${user.email} - ${user.email} - ${user.email}`;
    }

    // ==========================================
    // MENU RABATTABLE (Collapsible Sections)
    // ==========================================

    const menuSections = document.querySelectorAll('.menu-section');

    menuSections.forEach(section => {
        const header = section.querySelector('.menu-section-header');

        header.addEventListener('click', () => {
            // Toggle la section
            section.classList.toggle('open');
        });
    });

    // ==========================================
    // NAVIGATION MAIN MENU (Dashboard / E-Book / Outils)
    // ==========================================

    const menuItems = document.querySelectorAll('.menu-item');
    const contentSections = document.querySelectorAll('.content-section');
    const readerNav = document.getElementById('reader-nav');

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const section = item.dataset.section;

            // Mettre à jour les items actifs du menu
            menuItems.forEach(mi => mi.classList.remove('active'));
            item.classList.add('active');

            // Afficher la bonne section
            contentSections.forEach(cs => cs.classList.remove('active'));
            const targetSection = document.getElementById(`${section}-section`);

            if (targetSection) {
                targetSection.classList.add('active');
            } else {
                // Si la section n'existe pas encore, afficher un message temporaire
                console.log(`Section ${section} en cours de développement`);
            }

            // Afficher les boutons de navigation uniquement pour l'ebook
            if (section === 'ebook') {
                readerNav.classList.add('show');
            } else {
                readerNav.classList.remove('show');
            }

            // Initialiser le système de progression quand on accède à cette section
            if (section === 'progression') {
                console.log('🎯 Section progression activée, initialisation...');
                setTimeout(() => {
                    initProgressionSystem();
                }, 100);
            }
        });
    });

    // ==========================================
    // PROTECTIONS
    // ==========================================

    // 1. Désactiver le clic droit
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
    });

    // 2. Désactiver les raccourcis clavier de copie
    document.addEventListener('keydown', (e) => {
        // Ctrl+C, Ctrl+X, Ctrl+V, Ctrl+A, Ctrl+P
        if (e.ctrlKey && (e.key === 'c' || e.key === 'x' || e.key === 'v' || e.key === 'a' || e.key === 'p')) {
            e.preventDefault();
            return false;
        }
        // F12 (DevTools)
        if (e.key === 'F12') {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+I (DevTools)
        if (e.ctrlKey && e.shiftKey && e.key === 'I') {
            e.preventDefault();
            return false;
        }
    });

    // 3. Désactiver la sélection de texte (déjà fait en CSS)
    // user-select: none

    // 4. Détecter les DevTools (optionnel - peut être contourné)
    const devToolsCheck = () => {
        const threshold = 160;
        if (window.outerWidth - window.innerWidth > threshold ||
            window.outerHeight - window.innerHeight > threshold) {
            // DevTools probablement ouvert
            console.clear();
        }
    };
    setInterval(devToolsCheck, 1000);

    // ==========================================
    // GESTION DE SESSION ET INACTIVITÉ
    // ==========================================

    let inactivityTimer;
    const INACTIVITY_TIMEOUT = SESSION_TIMEOUT;

    const resetInactivityTimer = () => {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            alert('Session expirée pour cause d\'inactivité.');
            logout();
        }, INACTIVITY_TIMEOUT);
    };

    // Détecter l'activité
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, resetInactivityTimer);
    });

    resetInactivityTimer();

    // Vérifier périodiquement la session
    setInterval(async () => {
        try {
            await apiRequest('/reader/access');
        } catch (error) {
            alert('Session expirée ou invalide.');
            logout();
        }
    }, SESSION_CHECK_INTERVAL);

    // ==========================================
    // NAVIGATION ENTRE LES CHAPITRES
    // ==========================================

    const chapters = document.querySelectorAll('.chapter');
    const chapterLinks = document.querySelectorAll('.chapter-link');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    let currentChapterIndex = 0;

    const showChapter = (index) => {
        // Masquer tous les chapitres
        chapters.forEach(chapter => chapter.classList.remove('active'));

        // Afficher le chapitre sélectionné
        chapters[index].classList.add('active');

        // Mettre à jour les liens de navigation
        chapterLinks.forEach((link, i) => {
            if (i === index) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Mettre à jour les boutons
        prevBtn.disabled = index === 0;
        nextBtn.disabled = index === chapters.length - 1;

        // Scroll vers le haut
        window.scrollTo({ top: 0, behavior: 'smooth' });

        currentChapterIndex = index;
    };

    // Navigation par liens
    chapterLinks.forEach((link, index) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showChapter(index);
        });
    });

    // Boutons précédent/suivant
    prevBtn.addEventListener('click', () => {
        if (currentChapterIndex > 0) {
            showChapter(currentChapterIndex - 1);
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentChapterIndex < chapters.length - 1) {
            showChapter(currentChapterIndex + 1);
        }
    });

    // Navigation au clavier
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' && currentChapterIndex > 0) {
            showChapter(currentChapterIndex - 1);
        } else if (e.key === 'ArrowRight' && currentChapterIndex < chapters.length - 1) {
            showChapter(currentChapterIndex + 1);
        }
    });

    // ==========================================
    // SIDEBAR RESPONSIVE
    // ==========================================

    const ebookSidebar = document.getElementById('ebook-sidebar');
    const mainSidebar = document.getElementById('main-sidebar');

    // Pour les petits écrans, ajouter un bouton pour toggle les sidebars si nécessaire
    // (Optionnel - pour l'instant les sidebars sont fixes sur desktop)

    // ==========================================
    // DÉCONNEXION
    // ==========================================

    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn.addEventListener('click', async () => {
        try {
            await apiRequest('/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error('Erreur déconnexion:', error);
        }
        logout();
    });

    // ==========================================
    // PROTECTION CONTRE L'IMPRESSION
    // ==========================================

    window.addEventListener('beforeprint', (e) => {
        e.preventDefault();
        alert('L\'impression est désactivée pour protéger le contenu.');
        return false;
    });

    // Afficher le premier chapitre
    showChapter(0);

    // ==========================================
    // OUTIL INTERACTIF : ÉCRIRE MON IDÉE
    // ==========================================

    const ideaToolBtn = document.getElementById('idea-tool-btn');
    const ideaToolContent = document.getElementById('idea-tool-content');
    const saveIdeaBtn = document.getElementById('save-idea-btn');
    const ideaSavedMsg = document.getElementById('idea-saved-msg');

    // Champs du formulaire
    const ideaNameField = document.getElementById('idea-name');
    const ideaTargetField = document.getElementById('idea-target');
    const ideaHowField = document.getElementById('idea-how');
    const ideaProblemField = document.getElementById('idea-problem');

    // Toggle l'outil
    ideaToolBtn.addEventListener('click', () => {
        ideaToolContent.classList.toggle('active');
    });

    // Charger les données sauvegardées au chargement
    const loadIdeaData = () => {
        const savedIdea = localStorage.getItem('french-connexion-idea');
        if (savedIdea) {
            try {
                const data = JSON.parse(savedIdea);
                ideaNameField.value = data.name || '';
                ideaTargetField.value = data.target || '';
                ideaHowField.value = data.how || '';
                ideaProblemField.value = data.problem || '';
            } catch (error) {
                console.error('Erreur chargement idée:', error);
            }
        }
    };

    // Sauvegarder l'idée
    saveIdeaBtn.addEventListener('click', () => {
        const ideaData = {
            name: ideaNameField.value,
            target: ideaTargetField.value,
            how: ideaHowField.value,
            problem: ideaProblemField.value,
            savedAt: new Date().toISOString()
        };

        // Sauvegarder dans localStorage
        localStorage.setItem('french-connexion-idea', JSON.stringify(ideaData));

        // Afficher le message de confirmation
        ideaSavedMsg.classList.add('show');

        // Masquer le message après 3 secondes
        setTimeout(() => {
            ideaSavedMsg.classList.remove('show');
        }, 3000);
    });

    // Charger les données au démarrage
    loadIdeaData();

    // ==========================================
    // SYSTÈME DE SAUVEGARDE POUR LES 9 ÉTAPES
    // ==========================================

    // Fonction générique pour sauvegarder une étape
    const saveEtape = (etapeNum, fields) => {
        const data = {};
        fields.forEach(fieldId => {
            const element = document.getElementById(fieldId);
            if (element) {
                data[fieldId] = element.value;
            }
        });
        data.savedAt = new Date().toISOString();
        localStorage.setItem(`french-connexion-etape-${etapeNum}`, JSON.stringify(data));
    };

    // Fonction générique pour charger une étape
    const loadEtape = (etapeNum, fields) => {
        const saved = localStorage.getItem(`french-connexion-etape-${etapeNum}`);
        if (saved) {
            try {
                const data = JSON.parse(saved);
                fields.forEach(fieldId => {
                    const element = document.getElementById(fieldId);
                    if (element && data[fieldId]) {
                        element.value = data[fieldId];
                    }
                });
            } catch (error) {
                console.error(`Erreur chargement étape ${etapeNum}:`, error);
            }
        }
    };

    // Fonction pour afficher le message de sauvegarde
    const showSavedMessage = (msgId) => {
        const msg = document.getElementById(msgId);
        if (msg) {
            msg.classList.add('show');
            setTimeout(() => msg.classList.remove('show'), 3000);
        }
    };

    // ÉTAPE 1: Mon Idée (formulaire principal)
    const etape1FieldsMain = ['idea-name-main', 'idea-target-main', 'idea-how-main', 'idea-problem-main'];
    const saveEtape1BtnMain = document.getElementById('save-idea-btn-main');

    if (saveEtape1BtnMain) {
        saveEtape1BtnMain.addEventListener('click', () => {
            saveEtape(1, etape1FieldsMain);
            showSavedMessage('idea-saved-msg-main');
        });
        loadEtape(1, etape1FieldsMain);
    }

    // ÉTAPE 2: L'écrire
    const etape2Fields = ['etape2-pitch', 'etape2-vision', 'etape2-valeur', 'etape2-diff'];
    const saveEtape2Btn = document.getElementById('save-etape2-btn');

    if (saveEtape2Btn) {
        saveEtape2Btn.addEventListener('click', () => {
            saveEtape(2, etape2Fields);
            showSavedMessage('etape2-saved-msg');
        });
        loadEtape(2, etape2Fields);
    }

    // ÉTAPE 3: Apprendre
    const etape3Fields = ['etape3-faire', 'etape3-eviter', 'etape3-marche', 'etape3-concurrence'];
    const saveEtape3Btn = document.getElementById('save-etape3-btn');

    if (saveEtape3Btn) {
        saveEtape3Btn.addEventListener('click', () => {
            saveEtape(3, etape3Fields);
            showSavedMessage('etape3-saved-msg');
        });
        loadEtape(3, etape3Fields);
    }

    // ÉTAPE 4: Comprendre
    const etape4Fields = ['etape4-veux', 'etape4-fort', 'etape4-nul', 'etape4-changer'];
    const saveEtape4Btn = document.getElementById('save-etape4-btn');

    if (saveEtape4Btn) {
        saveEtape4Btn.addEventListener('click', () => {
            saveEtape(4, etape4Fields);
            showSavedMessage('etape4-saved-msg');
        });
        loadEtape(4, etape4Fields);
    }

    // ÉTAPE 5: Mes Objectifs
    const etape5Fields = ['etape5-combien', 'etape5-quand', 'etape5-comment', 'etape5-pourquoi'];
    const saveEtape5Btn = document.getElementById('save-etape5-btn');

    if (saveEtape5Btn) {
        saveEtape5Btn.addEventListener('click', () => {
            saveEtape(5, etape5Fields);
            showSavedMessage('etape5-saved-msg');
        });
        loadEtape(5, etape5Fields);
    }

    // ÉTAPE 6: Pourquoi j'échouerai ?
    const etape6Fields = ['etape6-perso', 'etape6-projet', 'etape6-externe'];
    const saveEtape6Btn = document.getElementById('save-etape6-btn');

    if (saveEtape6Btn) {
        saveEtape6Btn.addEventListener('click', () => {
            saveEtape(6, etape6Fields);
            showSavedMessage('etape6-saved-msg');
        });
        loadEtape(6, etape6Fields);
    }

    // ÉTAPE 7: Analyser
    const etape7Fields = ['etape7-solutions', 'etape7-strategies', 'etape7-actions'];
    const saveEtape7Btn = document.getElementById('save-etape7-btn');

    if (saveEtape7Btn) {
        saveEtape7Btn.addEventListener('click', () => {
            saveEtape(7, etape7Fields);
            showSavedMessage('etape7-saved-msg');
        });
        loadEtape(7, etape7Fields);
    }

    // ÉTAPE 8: Créer
    const etape8Fields = ['etape8-lance', 'etape8-teste', 'etape8-rate', 'etape8-corrige', 'etape8-next'];
    const saveEtape8Btn = document.getElementById('save-etape8-btn');

    if (saveEtape8Btn) {
        saveEtape8Btn.addEventListener('click', () => {
            saveEtape(8, etape8Fields);
            showSavedMessage('etape8-saved-msg');
        });
        loadEtape(8, etape8Fields);
    }

    // ÉTAPE 9: Développer
    const etape9Fields = ['etape9-ameliore', 'etape9-clients', 'etape9-metrics', 'etape9-collab', 'etape9-vision'];
    const saveEtape9Btn = document.getElementById('save-etape9-btn');

    if (saveEtape9Btn) {
        saveEtape9Btn.addEventListener('click', () => {
            saveEtape(9, etape9Fields);
            showSavedMessage('etape9-saved-msg');
        });
        loadEtape(9, etape9Fields);
    }

    // ==========================================
    // SECTION "MES NOTES" - AFFICHER L'IDÉE
    // ==========================================

    const displayIdeaName = document.getElementById('display-idea-name');
    const displayIdeaTarget = document.getElementById('display-idea-target');
    const displayIdeaHow = document.getElementById('display-idea-how');
    const displayIdeaProblem = document.getElementById('display-idea-problem');
    const displayIdeaSavedDate = document.getElementById('idea-saved-date');
    const ideaEmptyState = document.getElementById('idea-empty-state');
    const ideaFilledState = document.getElementById('idea-filled-state');
    const editIdeaBtn = document.getElementById('edit-idea-btn');

    // Fonction pour afficher l'idée dans "Mes Notes"
    const displaySavedIdea = () => {
        const savedIdea = localStorage.getItem('french-connexion-idea');
        if (savedIdea) {
            try {
                const data = JSON.parse(savedIdea);

                // Si au moins un champ est rempli
                if (data.name || data.target || data.how || data.problem) {
                    displayIdeaName.textContent = data.name || '-';
                    displayIdeaTarget.textContent = data.target || '-';
                    displayIdeaHow.textContent = data.how || '-';
                    displayIdeaProblem.textContent = data.problem || '-';

                    // Afficher la date de sauvegarde
                    if (data.savedAt) {
                        const date = new Date(data.savedAt);
                        const dateStr = date.toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                        displayIdeaSavedDate.textContent = `Sauvegardé le ${dateStr}`;
                    }

                    // Afficher l'état rempli
                    ideaEmptyState.style.display = 'none';
                    ideaFilledState.style.display = 'block';
                } else {
                    // Afficher l'état vide
                    ideaEmptyState.style.display = 'block';
                    ideaFilledState.style.display = 'none';
                }
            } catch (error) {
                console.error('Erreur affichage idée:', error);
                ideaEmptyState.style.display = 'block';
                ideaFilledState.style.display = 'none';
            }
        } else {
            // Aucune idée sauvegardée
            ideaEmptyState.style.display = 'block';
            ideaFilledState.style.display = 'none';
        }
    };

    // Bouton "Modifier" - redirige vers le chapitre 1
    editIdeaBtn.addEventListener('click', () => {
        // Activer l'onglet E-Book
        menuItems.forEach(mi => mi.classList.remove('active'));
        document.querySelector('[data-section="ebook"]').classList.add('active');

        // Afficher la section E-Book
        contentSections.forEach(cs => cs.classList.remove('active'));
        document.getElementById('ebook-section').classList.add('active');

        // Afficher le chapitre 1
        showChapter(1); // Chapitre 1 = index 1

        // Ouvrir l'outil d'édition
        ideaToolContent.classList.add('active');

        // Scroll vers le haut
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Afficher les boutons de navigation
        readerNav.classList.add('show');
    });

    // Afficher l'idée au chargement
    displaySavedIdea();

    // ==========================================
    // BOUTONS "ALLER À L'OUTIL ÉTAPE X" dans l'ebook
    // ==========================================

    const chapterToToolBtns = document.querySelectorAll('.chapter-to-tool-btn');

    chapterToToolBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetSection = btn.dataset.gotoSection;

            // Activer l'onglet "Le Processus" correspondant dans le menu
            menuItems.forEach(mi => mi.classList.remove('active'));
            const targetMenuItem = document.querySelector(`[data-section="${targetSection}"]`);
            if (targetMenuItem) {
                targetMenuItem.classList.add('active');
            }

            // Afficher la section de l'étape
            contentSections.forEach(cs => cs.classList.remove('active'));
            const targetSectionElement = document.getElementById(`${targetSection}-section`);
            if (targetSectionElement) {
                targetSectionElement.classList.add('active');
            }

            // Masquer les boutons de navigation de l'ebook
            readerNav.classList.remove('show');

            // Scroll vers le haut
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    // Rafraîchir l'affichage quand on sauvegarde
    const originalSaveHandler = saveIdeaBtn.onclick;
    saveIdeaBtn.addEventListener('click', () => {
        // Attendre un peu pour que la sauvegarde soit faite
        setTimeout(() => {
            displaySavedIdea();
        }, 100);
    });

    // ==========================================
    // GESTION DE LA PROGRESSION DES ÉTAPES
    // ==========================================

    // Variable globale pour éviter la double initialisation
    let progressionInitialized = false;

    function initProgressionSystem() {
        if (progressionInitialized) {
            console.log('⚠️ Système de progression déjà initialisé');
            return;
        }

        console.log('🚀 Initialisation du système de progression...');

        const stepCheckboxes = document.querySelectorAll('.step-checkbox');
        const stepExpandBtns = document.querySelectorAll('.step-expand-btn');
        const stepSaveBtns = document.querySelectorAll('.step-save-btn');
        const stepNotes = document.querySelectorAll('.step-notes');
        const completionMessage = document.getElementById('completion-message');

        console.log('Checkboxes trouvées:', stepCheckboxes.length);

        // Vérifier que les checkboxes existent
        if (stepCheckboxes.length === 0) {
            console.error('❌ Aucune checkbox trouvée!');
            return;
        }

    // Messages motivants pour chaque étape
    const motivationalMessages = {
        1: "💪 Bravo ! Tu viens de poser ta première pierre. Continue !",
        2: "🔥 Excellent ! Ton idée est maintenant réelle. Elle respire.",
        3: "👀 Parfait ! Tu n'es plus aveugle. Tu vois le chemin.",
        4: "🧠 Impressionnant ! Tu te connais mieux. C'est une force.",
        5: "🎯 Bien joué ! Tu as un cap clair. Pas de place pour l'improvisation.",
        6: "⚡ Solide ! Tu es armé contre l'échec. Tu es prêt.",
        7: "💡 Génial ! Chaque problème a maintenant une solution.",
        8: "🚀 ÉNORME ! Tu es passé à l'action. 99% ne le font jamais.",
        9: "🏆 CHAMPION ! Tu construis quelque chose qui dure. Continue !"
    };

    // Charger la progression depuis localStorage
    function loadProgress() {
        const savedProgress = localStorage.getItem(`french-connexion-progress-${user.email}`);
        const savedNotes = localStorage.getItem(`french-connexion-notes-${user.email}`);

        if (savedProgress) {
            const progress = JSON.parse(savedProgress);
            progress.forEach(stepNum => {
                const checkbox = document.querySelector(`.step-checkbox[data-step="${stepNum}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                    updateStepCard(stepNum, true);
                }
            });
        }

        if (savedNotes) {
            const notes = JSON.parse(savedNotes);
            Object.keys(notes).forEach(stepNum => {
                const textarea = document.querySelector(`.step-notes[data-step="${stepNum}"]`);
                if (textarea) {
                    textarea.value = notes[stepNum];
                }
            });
        }

        // Vérifier si toutes les étapes sont complétées
        checkCompletion();
    }

    // Sauvegarder la progression
    function saveProgress() {
        const checkedSteps = [];
        stepCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                checkedSteps.push(parseInt(checkbox.dataset.step));
            }
        });
        localStorage.setItem(`french-connexion-progress-${user.email}`, JSON.stringify(checkedSteps));
    }

    // Sauvegarder les notes
    function saveNotes() {
        const notes = {};
        stepNotes.forEach(textarea => {
            if (textarea.value.trim()) {
                notes[textarea.dataset.step] = textarea.value;
            }
        });
        localStorage.setItem(`french-connexion-notes-${user.email}`, JSON.stringify(notes));
    }

    // Mettre à jour la carte d'étape
    function updateStepCard(stepNum, isCompleted) {
        const card = document.querySelector(`.step-card[data-step="${stepNum}"]`);
        if (card) {
            if (isCompleted) {
                card.classList.add('completed');
            } else {
                card.classList.remove('completed');
            }
        }
    }

    // Vérifier si toutes les étapes sont complétées
    function checkCompletion() {
        const totalSteps = stepCheckboxes.length;
        const completedSteps = Array.from(stepCheckboxes).filter(cb => cb.checked).length;

        // Afficher le message de félicitations si 100%
        if (completedSteps === totalSteps) {
            if (completionMessage) completionMessage.classList.add('show');
        } else {
            if (completionMessage) completionMessage.classList.remove('show');
        }
    }

    // Gérer les checkboxes - sauvegarde automatique
    console.log('🎯 Initialisation des event listeners pour', stepCheckboxes.length, 'checkboxes');
    stepCheckboxes.forEach((checkbox, index) => {
        checkbox.addEventListener('change', (e) => {
            const stepNum = parseInt(e.target.dataset.step);
            const isChecked = e.target.checked;

            console.log(`✅ Checkbox ${stepNum} changée:`, isChecked);

            // Mettre à jour le visuel de la carte
            updateStepCard(stepNum, isChecked);

            // Sauvegarder automatiquement
            saveProgress();

            // Vérifier si toutes les étapes sont complétées
            checkCompletion();

            // Afficher un message motivant
            if (isChecked) {
                showMotivationalMessage(stepNum);
            }
        });
    });

    // Afficher un message motivant
    function showMotivationalMessage(stepNum) {
        const card = document.querySelector(`.step-card[data-step="${stepNum}"]`);
        const messageDiv = card.querySelector('.step-message');

        messageDiv.textContent = motivationalMessages[stepNum];
        messageDiv.classList.add('show', 'success');

        setTimeout(() => {
            messageDiv.classList.remove('show');
        }, 4000);
    }

    // Gérer l'expansion des cartes
    stepExpandBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const stepNum = btn.dataset.step;
            const card = document.querySelector(`.step-card[data-step="${stepNum}"]`);
            card.classList.toggle('expanded');

            // Changer l'icône du bouton
            btn.textContent = card.classList.contains('expanded') ? '✖️' : '📝';
        });
    });

    // Gérer la sauvegarde des notes
    stepSaveBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const stepNum = btn.dataset.step;
            saveNotes();

            const card = document.querySelector(`.step-card[data-step="${stepNum}"]`);
            const messageDiv = card.querySelector('.step-message');

            messageDiv.textContent = "✅ Tes notes ont été sauvegardées !";
            messageDiv.classList.add('show', 'success');

            setTimeout(() => {
                messageDiv.classList.remove('show');
            }, 3000);
        });
    });

        // Charger la progression
        loadProgress();

        // Marquer comme initialisé
        progressionInitialized = true;
        console.log('✅ Système de progression initialisé avec succès!');
    }

    // Essayer d'initialiser au démarrage (au cas où la section est déjà active)
    if (document.getElementById('progression-section')) {
        console.log('Section progression détectée au chargement');
        // Attendre que tout soit chargé
        setTimeout(() => {
            initProgressionSystem();
        }, 500);
    }
});
