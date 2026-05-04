<script setup lang="ts">
/**
 * Tuile vidéo distante.
 *
 * Gère la liaison réactive entre un MediaStream et l'élément <video>.
 * srcObject doit être assigné via JS (pas v-bind possible).
 */
const props = defineProps<{
  stream: MediaStream | null
  label: string
}>()

const videoEl = ref<HTMLVideoElement | null>(null)

watch(
  () => props.stream,
  (stream) => {
    if (videoEl.value) {
      videoEl.value.srcObject = stream
      if (stream) videoEl.value.play().catch(() => {})
    }
  },
  { immediate: true }
)

onMounted(() => {
  if (videoEl.value && props.stream) {
    videoEl.value.srcObject = props.stream
    videoEl.value.play().catch(() => {})
  }
})
</script>

<template>
  <div class="remote-tile">
    <video ref="videoEl" autoplay playsinline class="remote-video" />
    <div v-if="!stream" class="waiting-overlay">
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#444" stroke-width="1.5">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
      <span>Connexion…</span>
    </div>
    <div class="tile-label">{{ label }}</div>
  </div>
</template>

<style scoped>
.remote-tile {
  position: relative;
  background: #1a1a1a;
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 16 / 9;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remote-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.waiting-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #555;
  font-size: 0.8rem;
}

.tile-label {
  position: absolute;
  bottom: 0.5rem;
  left: 0.75rem;
  font-size: 0.72rem;
  background: rgba(0, 0, 0, 0.6);
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  color: #ccc;
}
</style>
