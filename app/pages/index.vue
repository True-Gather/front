<template>
  <div class="landing-page">
    <header class="topbar">
      <div class="brand">
        <img src="/logo.jfif" alt="TrueGather Logo" class="logo" />
        <span class="brand-name">TrueGather</span>
      </div>

      <nav class="nav-actions">
        <button class="btn btn-secondary" type="button" @click="goToLogin">
          Se connecter
        </button>
        <button class="btn btn-primary" type="button" @click="goToRegister">
          Créer un compte
        </button>
      </nav>
    </header>

    <main class="hero">
      <div class="hero-card">
        <span class="hero-badge">Plateforme de collaboration sécurisée</span>

        <h1 class="hero-title">
          Réunissez, planifiez et collaborez efficacement avec TrueGather
        </h1>

        <p class="hero-description">
          Centralisez vos réunions, vos groupes et votre planning dans une
          interface moderne pensée pour la productivité et la simplicité.
        </p>

        <div class="hero-actions">
          <button class="btn btn-primary btn-large" type="button" @click="goToLogin">
            Se connecter
          </button>
          <button class="btn btn-secondary btn-large" type="button" @click="goToRegister">
            Créer un compte
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()

const backendBaseUrl =
  runtimeConfig.public.backendBaseUrl || 'http://localhost:8080'

const goToLogin = () => {
  window.location.href = `${backendBaseUrl}/api/v1/auth/login`
}

const goToRegister = () => {
  window.location.href = `${backendBaseUrl}/api/v1/auth/register`
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.landing-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(20, 184, 166, 0.18), transparent 30%),
    radial-gradient(circle at bottom right, rgba(59, 130, 246, 0.18), transparent 30%),
    linear-gradient(135deg, #f0fdfa 0%, #cffafe 50%, #d1fae5 100%);
  color: #0f172a;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.topbar {
  width: 100%;
  padding: 20px 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(153, 246, 228, 0.9);
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  width: 56px;
  height: 56px;
  object-fit: contain;
}

.brand-name {
  font-size: 28px;
  font-weight: 800;
  background: linear-gradient(to right, #0d9488, #0891b2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-actions,
.hero-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.hero {
  min-height: calc(100vh - 96px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
}

.hero-card {
  width: 100%;
  max-width: 860px;
  text-align: center;
  background: rgba(255, 255, 255, 0.74);
  border: 1px solid rgba(153, 246, 228, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 28px;
  padding: 56px 40px;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
}

.hero-badge {
  display: inline-block;
  margin-bottom: 18px;
  padding: 8px 14px;
  border-radius: 999px;
  background: #ccfbf1;
  color: #0f766e;
  font-size: 14px;
  font-weight: 700;
}

.hero-title {
  font-size: clamp(2.4rem, 5vw, 4rem);
  line-height: 1.08;
  margin-bottom: 18px;
  color: #111827;
}

.hero-description {
  max-width: 720px;
  margin: 0 auto 30px;
  font-size: 1.08rem;
  line-height: 1.7;
  color: #475569;
}

.btn {
  border: none;
  border-radius: 14px;
  padding: 12px 20px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.22s ease;
}

.btn-large {
  padding: 15px 26px;
  font-size: 16px;
}

.btn-primary {
  background: linear-gradient(135deg, #14b8a6, #0891b2);
  color: white;
  box-shadow: 0 10px 22px rgba(20, 184, 166, 0.22);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 26px rgba(20, 184, 166, 0.3);
}

.btn-secondary {
  background: white;
  color: #0f766e;
  border: 1px solid #99f6e4;
}

.btn-secondary:hover {
  background: #f0fdfa;
}

@media (max-width: 768px) {
  .topbar {
    padding: 18px;
    flex-direction: column;
    gap: 16px;
  }

  .hero-card {
    padding: 38px 22px;
  }

  .nav-actions,
  .hero-actions {
    width: 100%;
    flex-direction: column;
  }

  .btn,
  .btn-large {
    width: 100%;
  }
}
</style>