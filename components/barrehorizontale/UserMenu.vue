<template>
  <div class="user-menu" ref="userMenuRef">
    <button class="icon-btn primary" @click="userMenuOpen = !userMenuOpen">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    </button>

    <div class="user-dropdown" v-if="userMenuOpen">
      <div class="dropdown-info">
        <strong>Mon Compte</strong>
        <span>adam@truegather.com</span>
      </div>
      <hr />
      <button class="dropdown-item">👤 Profil</button>
      <hr />
      <button class="dropdown-item logout">🚪 Se déconnecter</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const userMenuOpen = ref(false)
const userMenuRef = ref(null)

function handleClickOutside(e) {
  if (userMenuRef.value && !userMenuRef.value.contains(e.target)) {
    userMenuOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<style scoped>
.user-menu {
  position: relative;
}

.icon-btn.primary {
  background: linear-gradient(135deg, #14b8a6, #0891b2);
  color: white;
  border: none;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.35);
}

.icon-btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(20, 184, 166, 0.5);
}

.icon-btn.primary:active {
  transform: translateY(0px);
  box-shadow: 0 2px 8px rgba(20, 184, 166, 0.3);
}


.user-dropdown {
  position: absolute;
  top: 48px;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  width: 200px;
  z-index: 100;
  overflow: hidden;
}

.dropdown-info {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dropdown-info strong {
  font-size: 14px;
  color: #1f2937;
}

.dropdown-info span {
  font-size: 12px;
  color: #6b7280;
}

.dropdown-item {
  width: 100%;
  padding: 10px 16px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
  transition: background 0.2s;
}

.dropdown-item:hover {
  background: #f0fdfa;
}

.dropdown-item.logout {
  color: #ef4444;
}

.dropdown-item.logout:hover {
  background: #fef2f2;
}

hr {
  border: none;
  border-top: 1px solid #f3f4f6;
  margin: 0;
}
</style>
