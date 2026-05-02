<template>
  <div class="auth-root">
    <!-- Animated background blobs -->
    <div class="bg-blob blob-1"></div>
    <div class="bg-blob blob-2"></div>
    <div class="bg-blob blob-3"></div>

    <!-- Grid pattern overlay -->
    <div class="grid-overlay"></div>

    <div class="auth-wrapper">
      <!-- Left panel — branding -->
      <div class="brand-panel">
        <div class="brand-content">
          <div class="brand-logo">
            <div class="logo-shield">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <span class="brand-name">TrueGather</span>
          </div>

          <div class="brand-headline">
            <h1>Réunissez vos équipes,<br/><em>partout, à tout moment.</em></h1>
            <p>La plateforme tout-en-un pour planifier, rejoindre et analyser vos visioconférences d'équipe.</p>
          </div>

          <!-- Feature pills -->
          <div class="features">
            <div class="feature-pill">
              <div class="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m22 8-6 4 6 4V8Z"></path>
                  <rect width="14" height="12" x="2" y="6" rx="2" ry="2"></rect>
                </svg>
              </div>
              <span>Meetings instantanés</span>
            </div>
            <div class="feature-pill">
              <div class="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2a10 10 0 1 0 10 10"></path>
                  <path d="M12 8v4l3 3"></path>
                </svg>
              </div>
              <span>Assistant IA intégré</span>
            </div>
            <div class="feature-pill">
              <div class="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                  <line x1="3" x2="21" y1="10" y2="10"></line>
                </svg>
              </div>
              <span>Planning collaboratif</span>
            </div>
            <div class="feature-pill">
              <div class="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <span>Gestion de groupes</span>
            </div>
          </div>

          <!-- Floating card decoration -->
          <div class="deco-card deco-card-1">
            <div class="deco-avatar">A</div>
            <div class="deco-info">
              <span class="deco-name">Alexandre</span>
              <span class="deco-sub">Réunion design — En cours</span>
            </div>
            <span class="deco-live">● Live</span>
          </div>

          <div class="deco-card deco-card-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Standup quotidien planifié — 09:00</span>
          </div>
        </div>
      </div>

      <!-- Right panel — actions -->
      <div class="form-panel">
        <div class="form-card">
          <div class="form-greeting">
            <div class="greeting-logo">
              <div class="logo-shield-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <span class="greeting-brand">TrueGather</span>
            </div>
            <h2>Bienvenue</h2>
            <p>Accédez à votre espace de collaboration sécurisé via votre compte d'organisation.</p>
          </div>

          <div class="action-btns">
            <button class="cta-btn" @click="handleLogin">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10 17 15 12 10 7"></polyline>
                <line x1="15" x2="3" y1="12" y2="12"></line>
              </svg>
              <span>Se connecter</span>
            </button>

            <button class="cta-btn outline" @click="handleRegister">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <line x1="19" x2="19" y1="8" y2="14"></line>
                <line x1="22" x2="16" y1="11" y2="11"></line>
              </svg>
              <span>Créer un compte</span>
            </button>
          </div>

          <p class="sso-note">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            Authentification sécurisée via SSO
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()

const backendBaseUrl = runtimeConfig.public.backendBaseUrl || 'http://localhost:8082'

function handleLogin() {
  window.location.href = `${backendBaseUrl}/api/v1/auth/login`
}

function handleRegister() {
  window.location.href = `${backendBaseUrl}/api/v1/auth/register`
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Lora:ital,wght@0,400;1,400&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.auth-root {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0fdfa 0%, #cffafe 50%, #d1fae5 100%);
  display: flex;
  align-items: stretch;
  position: relative;
  overflow: hidden;
  font-family: 'Outfit', sans-serif;
}

/* ── Background decoration ── */
.bg-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.45;
  pointer-events: none;
  animation: drift 12s ease-in-out infinite alternate;
}
.blob-1 {
  width: 500px; height: 500px;
  background: radial-gradient(circle, #14b8a6, transparent);
  top: -150px; left: -100px;
  animation-duration: 14s;
}
.blob-2 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, #0891b2, transparent);
  bottom: -100px; right: 20%;
  animation-duration: 10s;
}
.blob-3 {
  width: 300px; height: 300px;
  background: radial-gradient(circle, #10b981, transparent);
  top: 40%; right: -80px;
  animation-duration: 16s;
}

@keyframes drift {
  from { transform: translate(0, 0) scale(1); }
  to   { transform: translate(30px, 20px) scale(1.08); }
}

.grid-overlay {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(20,184,166,0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(20,184,166,0.06) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
}

/* ── Layout ── */
.auth-wrapper {
  display: flex;
  width: 100%;
  position: relative;
  z-index: 1;
}

/* ── Brand panel ── */
.brand-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 48px;
}

.brand-content {
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 14px;
}

.logo-shield {
  width: 52px; height: 52px;
  background: linear-gradient(135deg, #14b8a6, #0891b2);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(20,184,166,0.4);
}

.brand-name {
  font-size: 28px;
  font-weight: 800;
  background: linear-gradient(to right, #0d9488, #0891b2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
}

.brand-headline h1 {
  font-size: 40px;
  font-weight: 700;
  line-height: 1.2;
  color: #1f2937;
  letter-spacing: -1px;
  margin-bottom: 16px;
}

.brand-headline h1 em {
  font-style: normal;
  font-family: 'Lora', serif;
  background: linear-gradient(to right, #0d9488, #0891b2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-headline p {
  font-size: 16px;
  color: #6b7280;
  line-height: 1.6;
  font-weight: 400;
}

/* Feature pills */
.features {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.feature-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 1px solid rgba(20,184,166,0.2);
  border-radius: 100px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.feature-icon {
  width: 26px; height: 26px;
  background: linear-gradient(135deg, #14b8a6, #0891b2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

/* Decoration cards */
.deco-card {
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.9);
  border-radius: 16px;
  padding: 14px 18px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.08);
  font-size: 13px;
  color: #374151;
  animation: float 6s ease-in-out infinite;
}

.deco-card-1 {
  display: flex;
  align-items: center;
  gap: 12px;
  align-self: flex-start;
  margin-left: -10px;
}

.deco-card-2 {
  display: flex;
  align-items: center;
  gap: 10px;
  align-self: flex-end;
  margin-right: -10px;
  animation-delay: -3s;
  font-weight: 500;
  color: #0d9488;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-8px); }
}

.deco-avatar {
  width: 36px; height: 36px;
  background: linear-gradient(135deg, #14b8a6, #0891b2);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: white; font-weight: 700; font-size: 14px; flex-shrink: 0;
}

.deco-info { display: flex; flex-direction: column; gap: 2px; }
.deco-name { font-weight: 600; color: #111827; font-size: 13px; }
.deco-sub  { font-size: 11px; color: #9ca3af; }

.deco-live {
  margin-left: auto;
  font-size: 11px;
  font-weight: 700;
  color: #10b981;
  background: #d1fae5;
  padding: 3px 8px;
  border-radius: 100px;
  flex-shrink: 0;
}

/* ── Form panel ── */
.form-panel {
  width: 460px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 32px;
  background: rgba(255,255,255,0.6);
  backdrop-filter: blur(20px);
  border-left: 1px solid rgba(255,255,255,0.8);
}

.form-card {
  width: 100%;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.form-greeting {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.greeting-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.logo-shield-sm {
  width: 40px; height: 40px;
  background: linear-gradient(135deg, #14b8a6, #0891b2);
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 14px rgba(20,184,166,0.35);
}

.greeting-brand {
  font-size: 20px;
  font-weight: 800;
  background: linear-gradient(to right, #0d9488, #0891b2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.form-greeting h2 {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  letter-spacing: -0.5px;
}

.form-greeting p {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
}

/* Action buttons */
.action-btns {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.cta-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: linear-gradient(135deg, #14b8a6, #0891b2);
  color: white;
  border: none;
  padding: 16px 24px;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s;
  box-shadow: 0 6px 20px rgba(20,184,166,0.4);
  font-family: 'Outfit', sans-serif;
  letter-spacing: 0.2px;
}

.cta-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 28px rgba(20,184,166,0.5);
}

.cta-btn:active { transform: translateY(0); }

.cta-btn.outline {
  background: white;
  color: #0d9488;
  border: 2px solid rgba(20,184,166,0.3);
  box-shadow: 0 4px 14px rgba(0,0,0,0.06);
}

.cta-btn.outline:hover {
  border-color: #14b8a6;
  background: #f0fdfa;
  box-shadow: 0 8px 20px rgba(20,184,166,0.15);
}

/* SSO note */
.sso-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
}

.sso-note svg { color: #14b8a6; flex-shrink: 0; }

/* Responsive */
@media (max-width: 900px) {
  .brand-panel { display: none; }
  .form-panel {
    width: 100%;
    padding: 48px 24px;
    background: linear-gradient(135deg, #f0fdfa, #cffafe);
    border-left: none;
  }
}
</style>
