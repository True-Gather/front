<template>
  <div class="tg-chatbot-container">
    <div class="tg-chatbot-box" :class="{ open: isOpen }">
      <div class="tg-chatbot-header">
        <span>Assistant</span>
        <button type="button" class="tg-chatbot-close" @click="toggleChat">✖</button>
      </div>

      <div class="tg-chatbot-messages">
        <div class="tg-bot-message">Bonjour 👋 Comment puis-je vous aider ?</div>
        <div class="tg-bot-message">Je peux vous aider à préparer votre meeting.</div>
      </div>

      <div class="tg-chatbot-input">
        <input type="text" placeholder="Écrire un message..." />
        <button type="button">➤</button>
      </div>
    </div>

    <button class="tg-chatbot-toggle" type="button" @click="toggleChat">
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