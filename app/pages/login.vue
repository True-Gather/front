<script setup lang="ts">
definePageMeta({
  layout: "auth"
})

import { ref } from "vue"

const email = ref("")
const password = ref("")
const error = ref("")

function login() {
  error.value = ""

  if (!email.value) {
    error.value = "Veuillez entrer votre email"
    return
  }

  if (!password.value) {
    error.value = "Veuillez entrer votre mot de passe"
    return
  }

  console.log("login", email.value)
}
</script>

<template>
  <div class="bg-white border border-[#99f6e4] rounded-2xl shadow-lg p-8">
    <h2 class="text-2xl font-bold text-[#1f2937] mb-1">
      Connexion
    </h2>

    <p class="text-sm text-[#6b7280] mb-6">
      Accédez à votre espace TrueGather
    </p>

    <div class="flex flex-col gap-4">
      <div>
        <label class="block text-sm font-medium text-[#1f2937] mb-2">
          Adresse e-mail
        </label>
        <input
          v-model="email"
          type="email"
          placeholder="Ex : sophie.martin@entreprise.com"
          class="w-full border border-[#99f6e4] rounded-md px-3 py-2 text-[#1f2937] placeholder:text-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#14b8a6]"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-[#1f2937] mb-2">
          Mot de passe
        </label>
        <input
          v-model="password"
          type="password"
          placeholder="Entrez votre mot de passe"
          class="w-full border border-[#99f6e4] rounded-md px-3 py-2 text-[#1f2937] placeholder:text-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#14b8a6]"
        />
      </div>

      <p v-if="error" class="text-red-500 text-sm">
        {{ error }}
      </p>

      <button
        @click="login"
        class="bg-gradient-to-r from-[#14b8a6] to-[#0891b2] text-white py-2.5 rounded-md font-semibold hover:shadow-md transition"
      >
        Se connecter
      </button>

      <p class="text-sm text-center text-[#6b7280]">
        Pas de compte ?
        <NuxtLink to="/register" class="text-[#14b8a6] font-medium hover:underline">
          Créer un compte
        </NuxtLink>
      </p>
    </div>
  </div>
</template>