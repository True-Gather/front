<template>
  <section class="ve-page">

    <!-- Brand header -->
    <div class="ve-brand">
      <div class="ve-brand-icon">T</div>
      <div class="ve-brand-copy">
        <span class="ve-brand-name">TrueGather</span>
        <span class="ve-brand-sub">Secure collaboration workspace</span>
      </div>
    </div>

    <!-- Card centrale -->
    <div class="ve-card" :class="{ 've-card--error': state === 'error' }">

      <!-- ── STATE: pending ── -->
      <template v-if="state === 'pending'">

        <!-- Icône animée enveloppe -->
        <div class="ve-icon-wrap">
          <div class="ve-ring ve-ring--3" />
          <div class="ve-ring ve-ring--2" />
          <div class="ve-ring ve-ring--1" />
          <div class="ve-icon-circle">
            <svg class="ve-envelope" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="10" width="40" height="28" rx="4" fill="white" fill-opacity="0.15" stroke="white" stroke-width="2.5"/>
              <path d="M4 14l20 14 20-14" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>

        <div class="ve-chip">Vérification requise</div>
        <h1 class="ve-title">Vérifiez votre email</h1>
        <p class="ve-desc">
          Un lien de vérification vous a été envoyé par email.<br>
          Cliquez dessus pour activer votre compte.
        </p>

        <!-- Étapes de progression -->
        <div class="ve-steps">
          <div class="ve-step ve-step--done">
            <div class="ve-step-dot">
              <svg viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5L13 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
            <span>Compte créé</span>
          </div>
          <div class="ve-step-line ve-step-line--done" />
          <div class="ve-step ve-step--active">
            <div class="ve-step-dot">2</div>
            <span>Vérifier l'email</span>
          </div>
          <div class="ve-step-line" />
          <div class="ve-step">
            <div class="ve-step-dot">3</div>
            <span>Se connecter</span>
          </div>
        </div>

        <!-- Indicateur d'attente animé -->
        <div class="ve-waiting">
          <span class="ve-waiting-dot" />
          <span class="ve-waiting-dot" />
          <span class="ve-waiting-dot" />
          <span class="ve-waiting-label">En attente de vérification…</span>
        </div>

        <!-- Info spam -->
        <div class="ve-info-box">
          <span class="ve-info-ico">📋</span>
          <p>
            Pensez à vérifier vos dossiers <strong>spam</strong> et
            <strong>courrier indésirable</strong>.
          </p>
        </div>

        <NuxtLink to="/" class="ve-back">← Retour à l'accueil</NuxtLink>

      </template>

      <!-- ── STATE: verified ── -->
      <template v-else-if="state === 'verified'">

        <div class="ve-icon-wrap">
          <div class="ve-ring ve-ring--3" />
          <div class="ve-ring ve-ring--2" />
          <div class="ve-ring ve-ring--1" />
          <div class="ve-icon-circle">
            <svg class="ve-envelope" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="24" r="18" fill="white" fill-opacity="0.15" stroke="white" stroke-width="2.5"/>
              <path d="M15 24l6 6 12-12" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>

        <div class="ve-chip">Vérification réussie ✓</div>
        <h1 class="ve-title">Email vérifié !</h1>
        <p class="ve-desc">
          Votre adresse email a bien été confirmée.<br>
          Connectez-vous pour accéder à votre espace.
        </p>

        <!-- Étapes toutes complétées -->
        <div class="ve-steps">
          <div class="ve-step ve-step--done">
            <div class="ve-step-dot">
              <svg viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5L13 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
            <span>Compte créé</span>
          </div>
          <div class="ve-step-line ve-step-line--done" />
          <div class="ve-step ve-step--done">
            <div class="ve-step-dot">
              <svg viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5L13 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
            <span>Email vérifié</span>
          </div>
          <div class="ve-step-line ve-step-line--done" />
          <div class="ve-step ve-step--active">
            <div class="ve-step-dot">3</div>
            <span>Se connecter</span>
          </div>
        </div>

        <button class="ve-btn" style="margin-top: 8px" @click="goToLogin">Se connecter</button>

      </template>

      <!-- ── STATE: error ── -->
      <template v-else-if="state === 'error'">

        <div class="ve-icon-wrap ve-icon-wrap--error">
          <div class="ve-icon-circle ve-icon-circle--error">
            <svg class="ve-envelope" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="24" r="18" fill="white" fill-opacity="0.15" stroke="white" stroke-width="2.5"/>
              <path d="M24 14v12M24 32v2" stroke="white" stroke-width="3" stroke-linecap="round"/>
            </svg>
          </div>
        </div>

        <div class="ve-chip ve-chip--error">Erreur de vérification</div>
        <h1 class="ve-title">Lien invalide ou expiré</h1>
        <p class="ve-desc">
          <template v-if="errorCode === 'user_not_found'">
            Aucun compte n'est associé à ce lien de vérification.
          </template>
          <template v-else>
            Ce lien a déjà été utilisé ou est invalide.<br>
            Veuillez vous réinscrire pour recevoir un nouveau lien.
          </template>
        </p>
        <NuxtLink :to="authUser ? '/dashboard' : '/'" class="ve-btn">
          {{ authUser ? 'Accéder à mon espace' : 'Retour à l\'accueil' }}
        </NuxtLink>
      </template>

      <!-- ── STATE: default ── -->
      <template v-else>

        <div class="ve-icon-wrap">
          <div class="ve-ring ve-ring--1" />
          <div class="ve-icon-circle">
            <svg class="ve-envelope" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="10" width="40" height="28" rx="4" fill="white" fill-opacity="0.15" stroke="white" stroke-width="2.5"/>
              <path d="M4 14l20 14 20-14" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>

        <div class="ve-chip">Vérification email</div>
        <h1 class="ve-title">Page non accessible</h1>
        <p class="ve-desc">
          Cette page n'est accessible que depuis un lien de vérification envoyé par email.
        </p>
        <NuxtLink to="/" class="ve-back">← Retour à l'accueil</NuxtLink>
      </template>

    </div>

  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

definePageMeta({
  layout: 'auth'
})

const route = useRoute()
const router = useRouter()
const { authUser, logout } = useAuth()

const goToLogin = async () => {
  if (authUser.value) {
    await logout()
  } else {
    await router.push('/')
  }
}

// État dynamique : peut basculer de 'pending' → 'verified' sans rechargement.
const dynamicState = ref<'pending' | 'verified' | 'error' | 'default'>('default')

const initState = (): 'pending' | 'verified' | 'error' | 'default' => {
  if (route.query.pending === '1') return 'pending'
  if (route.query.verified === '1') return 'verified'
  if (route.query.error) return 'error'
  return 'default'
}

// Alias pour le template.
const state = computed(() => dynamicState.value)
const errorCode = computed(() => route.query.error as string | undefined)

const BROADCAST_CHANNEL = 'tg_email_verify'
const STORAGE_KEY = 'tg_email_verified'

let bc: BroadcastChannel | null = null

const onVerified = () => {
  dynamicState.value = 'verified'
  bc?.close()
  bc = null
}

onMounted(() => {
  dynamicState.value = initState()

  if (dynamicState.value === 'verified') {
    // Notifier les onglets en attente (même ou autre fenêtre).
    try {
      const notifyBc = new BroadcastChannel(BROADCAST_CHANNEL)
      notifyBc.postMessage('verified')
      notifyBc.close()
    } catch {}
    localStorage.setItem(STORAGE_KEY, Date.now().toString())
  }

  if (dynamicState.value === 'pending') {
    // Vérifier si la vérification a déjà eu lieu avant l'ouverture de cet onglet.
    if (localStorage.getItem(STORAGE_KEY)) {
      dynamicState.value = 'verified'
      return
    }

    // Écouter les notifications du même navigateur (autre onglet).
    try {
      bc = new BroadcastChannel(BROADCAST_CHANNEL)
      bc.onmessage = onVerified
    } catch {}

    // Écouter les événements localStorage (autre fenêtre/navigateur).
    window.addEventListener('storage', (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) onVerified()
    })
  }
})

onUnmounted(() => {
  bc?.close()
})
</script>

<style scoped>
/* ── Page wrapper ── */
.ve-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
  padding: 40px 20px;
  min-height: 100vh;
  justify-content: center;
}

/* ── Brand ── */
.ve-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ve-brand-icon {
  width: 44px;
  height: 44px;
  border-radius: 13px;
  background: linear-gradient(135deg, #14b8a6, #0891b2);
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 1.1rem;
  color: white;
  box-shadow: 0 8px 20px rgba(20, 184, 166, 0.35);
  flex-shrink: 0;
}

.ve-brand-copy {
  display: flex;
  flex-direction: column;
}

.ve-brand-name {
  font-size: 1rem;
  font-weight: 800;
  background: linear-gradient(to right, #0d9488, #0891b2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.2px;
}

.ve-brand-sub {
  font-size: 0.78rem;
  color: #9ca3af;
}

/* ── Card ── */
.ve-card {
  width: 100%;
  max-width: 500px;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(153, 246, 228, 0.6);
  border-radius: 28px;
  box-shadow:
    0 20px 60px rgba(15, 23, 42, 0.1),
    0 4px 16px rgba(20, 184, 166, 0.1);
  padding: 48px 40px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0;
}

.ve-card--error {
  border-color: rgba(239, 68, 68, 0.2);
  box-shadow:
    0 20px 60px rgba(15, 23, 42, 0.1),
    0 4px 16px rgba(239, 68, 68, 0.08);
}

/* ── Icône animée ── */
.ve-icon-wrap {
  position: relative;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 28px;
}

.ve-ring {
  position: absolute;
  border-radius: 50%;
  border: 2px solid rgba(20, 184, 166, 0.25);
  animation: ve-pulse 2.4s ease-out infinite;
}

.ve-ring--1 { width: 70px;  height: 70px;  animation-delay: 0s; }
.ve-ring--2 { width: 88px;  height: 88px;  animation-delay: 0.5s; }
.ve-ring--3 { width: 106px; height: 106px; animation-delay: 1s; }

@keyframes ve-pulse {
  0%   { opacity: 0.7; transform: scale(0.9); }
  60%  { opacity: 0;   transform: scale(1.15); }
  100% { opacity: 0;   transform: scale(1.15); }
}

.ve-icon-circle {
  width: 62px;
  height: 62px;
  border-radius: 50%;
  background: linear-gradient(135deg, #14b8a6, #0891b2);
  box-shadow: 0 10px 30px rgba(20, 184, 166, 0.45);
  display: grid;
  place-items: center;
  z-index: 2;
  animation: ve-float 4s ease-in-out infinite;
}

.ve-icon-circle--error {
  background: linear-gradient(135deg, #f87171, #ef4444);
  box-shadow: 0 10px 30px rgba(239, 68, 68, 0.35);
  animation: none;
}

@keyframes ve-float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-6px); }
}

.ve-envelope {
  width: 30px;
  height: 30px;
}

/* ── Chip ── */
.ve-chip {
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(20, 184, 166, 0.1);
  border: 1px solid rgba(20, 184, 166, 0.3);
  color: #0d9488;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.3px;
  margin-bottom: 14px;
}

.ve-chip--error {
  background: rgba(239, 68, 68, 0.08);
  border-color: rgba(239, 68, 68, 0.25);
  color: #ef4444;
}

/* ── Typography ── */
.ve-title {
  margin: 0 0 10px;
  font-size: 1.85rem;
  font-weight: 800;
  color: #1f2937;
  letter-spacing: -0.5px;
  line-height: 1.15;
}

.ve-desc {
  margin: 0 0 28px;
  font-size: 0.97rem;
  color: #6b7280;
  line-height: 1.65;
}

/* ── Étapes ── */
.ve-steps {
  display: flex;
  align-items: center;
  gap: 0;
  margin-bottom: 24px;
  width: 100%;
  justify-content: center;
}

.ve-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
}

.ve-step span {
  font-size: 0.72rem;
  font-weight: 600;
  color: #9ca3af;
  white-space: nowrap;
}

.ve-step--done .ve-step-dot {
  background: linear-gradient(135deg, #14b8a6, #0891b2);
  border-color: transparent;
  color: white;
}

.ve-step--done span {
  color: #0d9488;
}

.ve-step--active .ve-step-dot {
  background: linear-gradient(135deg, #14b8a6, #0891b2);
  border-color: transparent;
  color: white;
  box-shadow: 0 4px 14px rgba(20, 184, 166, 0.4);
  animation: ve-step-glow 1.8s ease-in-out infinite;
}

.ve-step--active span {
  color: #0d9488;
  font-weight: 700;
}

@keyframes ve-step-glow {
  0%, 100% { box-shadow: 0 4px 14px rgba(20, 184, 166, 0.35); }
  50%       { box-shadow: 0 6px 22px rgba(20, 184, 166, 0.6); }
}

.ve-step-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  color: #d1d5db;
  background: white;
}

.ve-step-dot svg {
  width: 16px;
  height: 16px;
}

.ve-step-line {
  flex: 1;
  height: 2px;
  background: #e5e7eb;
  margin: 0 6px;
  margin-bottom: 18px;
  min-width: 36px;
  max-width: 64px;
  border-radius: 2px;
}

.ve-step-line--done {
  background: linear-gradient(to right, #14b8a6, #0891b2);
}

/* ── Waiting animation ── */
.ve-waiting {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 22px;
}

.ve-waiting-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: linear-gradient(135deg, #14b8a6, #0891b2);
  animation: ve-bounce 1.4s ease-in-out infinite;
}

.ve-waiting-dot:nth-child(2) { animation-delay: 0.2s; }
.ve-waiting-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes ve-bounce {
  0%, 80%, 100% { transform: translateY(0);    opacity: 0.5; }
  40%           { transform: translateY(-6px); opacity: 1;   }
}

.ve-waiting-label {
  font-size: 0.82rem;
  color: #9ca3af;
  font-weight: 500;
  margin-left: 4px;
}

/* ── Info box ── */
.ve-info-box {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  background: linear-gradient(135deg, rgba(240, 253, 250, 0.9), rgba(207, 250, 254, 0.7));
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 16px;
  padding: 14px 18px;
  margin-bottom: 28px;
  text-align: left;
}

.ve-info-ico {
  font-size: 1.15rem;
  flex-shrink: 0;
  margin-top: 1px;
}

.ve-info-box p {
  margin: 0;
  font-size: 0.85rem;
  color: #4b5563;
  line-height: 1.55;
}

.ve-info-box strong {
  color: #0d9488;
}

/* ── Back link ── */
.ve-back {
  font-size: 0.9rem;
  font-weight: 600;
  color: #6b7280;
  text-decoration: none;
  transition: color 0.2s;
}

.ve-back:hover {
  color: #0d9488;
}

/* ── Primary button ── */
.ve-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  padding: 0 28px;
  border-radius: 14px;
  background: linear-gradient(135deg, #14b8a6, #0891b2);
  color: white;
  font-weight: 700;
  font-size: 0.95rem;
  text-decoration: none;
  box-shadow: 0 8px 22px rgba(20, 184, 166, 0.3);
  transition: all 0.2s;
  margin-top: 8px;
}

.ve-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(20, 184, 166, 0.42);
}

/* ── Footer ── */
.ve-footer {
  margin-top: 4px;
}

.ve-footer-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #14b8a6;
  background: rgba(20, 184, 166, 0.08);
  border: 1px solid rgba(20, 184, 166, 0.18);
  padding: 5px 12px;
  border-radius: 999px;
}

/* ── Responsive ── */
@media (max-width: 560px) {
  .ve-card {
    padding: 36px 24px 32px;
    border-radius: 22px;
  }

  .ve-title {
    font-size: 1.5rem;
  }

  .ve-step-line {
    min-width: 20px;
  }
}
</style>
