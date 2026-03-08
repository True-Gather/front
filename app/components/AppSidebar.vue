<template>
  <aside class="tg-sidebar" :class="{ collapsed: isCollapsed }">
    <button
      class="tg-sidebar-toggle"
      type="button"
      aria-label="Réduire ou étendre la sidebar"
      @click="isCollapsed = !isCollapsed"
    >
      <span>{{ isCollapsed ? '→' : '←' }}</span>
    </button>

    <div class="tg-sidebar-brand">
      <div class="tg-brand-icon">T</div>
      <div v-if="!isCollapsed" class="tg-brand-copy">
        <span class="tg-brand-name">TrueGather</span>
        <span class="tg-brand-subtitle">Collaboration hub</span>
      </div>
    </div>

    <nav class="tg-sidebar-nav">
      <NuxtLink
        v-for="item in items"
        :key="item.label"
        :to="item.to"
        class="tg-nav-item"
        :class="{ active: item.active }"
      >
        <span class="tg-nav-icon">{{ item.icon }}</span>

        <template v-if="!isCollapsed">
          <span class="tg-nav-label">{{ item.label }}</span>
          <span v-if="item.badge" class="tg-nav-badge">{{ item.badge }}</span>
        </template>
      </NuxtLink>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isCollapsed = ref(false)

const items = [
  { label: 'Accueil', to: '#', icon: '⌂', active: false },
  { label: 'Meetings', to: '/meetings/create', icon: '▣', badge: '3', active: true },
  { label: 'Historique', to: '#', icon: '◷', active: false },
  { label: 'Groupes', to: '#', icon: '◉', badge: '2', active: false },
  { label: 'Planning', to: '#', icon: '☰', active: false }
]
</script>