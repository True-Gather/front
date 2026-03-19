<template>
  <div class="tg-chatbot-container">
    <div class="tg-chatbot-box" :class="{ open: isOpen }">
      <div class="tg-chatbot-header">
        <span>Assistant</span>
        <button type="button" class="tg-chatbot-close" aria-label="Fermer l'assistant" @click="toggleChat">✖</button>
      </div>

      <div class="tg-chatbot-messages">
        <div class="tg-bot-message">Bonjour 👋 Comment puis-je vous aider ?</div>
        <div class="tg-bot-message">Je peux vous aider à préparer votre meeting.</div>
      </div>

      <div class="tg-chatbot-input">
        <label for="tg-chatbot-message" class="sr-only">Message à l'assistant</label>
        <input id="tg-chatbot-message" type="text" placeholder="Écrire un message..." />
        <button type="button" aria-label="Envoyer le message">➤</button>
      </div>
    </div>

    <button class="tg-chatbot-toggle" type="button" aria-label="Ouvrir l'assistant" @click="toggleChat">
      💬
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isOpen = ref(false)

const toggleChat = () => {
  isOpen.value = !isOpen.value
}
</script>