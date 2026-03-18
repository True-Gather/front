<script setup lang="ts">
definePageMeta({
  layout: "auth"
})

import { ref } from "vue"

const nom = ref("")
const prenom = ref("")
const email = ref("")
const password = ref("")
const confirmPassword = ref("")
const error = ref("")

function register() {
  error.value = ""

  if (!nom.value || !prenom.value) {
    error.value = "Veuillez remplir votre nom et prénom"
    return
  }

  if (!email.value) {
    error.value = "Veuillez entrer votre email"
    return
  }

  if (password.value.length < 14) {
    error.value = "Le mot de passe doit contenir au moins 14 caractères"
    return
  }

  if (password.value !== confirmPassword.value) {
    error.value = "Les mots de passe ne correspondent pas"
    return
  }

  console.log("register", email.value)
}
</script>

<template>
  <div class="bg-white border border-[#99f6e4] rounded-2xl shadow-lg p-8">
    <h2 class="text-2xl font-bold text-[#1f2937] mb-1">
      Inscription
    </h2>

    <p class="text-sm text-[#6b7280] mb-6">
      Créez votre compte sécurisé TrueGather
    </p>

    <div class="flex flex-col gap-4">
      <div>
        <label class="block text-sm font-medium text-[#1f2937] mb-2">
          Nom
        </label>
        <input
          v-model="nom"
          type="text"
          placeholder="Ex : Martin"
          class="w-full border border-[#99f6e4] rounded-md px-3 py-2 text-[#1f2937] placeholder:text-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#14b8a6]"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-[#1f2937] mb-2">
          Prénom
        </label>
        <input
          v-model="prenom"
          type="text"
          placeholder="Ex : Sophie"
          class="w-full border border-[#99f6e4] rounded-md px-3 py-2 text-[#1f2937] placeholder:text-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#14b8a6]"
        />
      </div>

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
        <p class="text-xs text-[#6b7280] mt-1">
          Minimum 14 caractères.
        </p>
      </div>

      <div>
        <label class="block text-sm font-medium text-[#1f2937] mb-2">
          Confirmer le mot de passe
        </label>
        <input
          v-model="confirmPassword"
          type="password"
          placeholder="Entrez le mot de passe à nouveau"
          class="w-full border border-[#99f6e4] rounded-md px-3 py-2 text-[#1f2937] placeholder:text-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#14b8a6]"
        />
      </div>

      <p v-if="error" class="text-red-500 text-sm">
        {{ error }}
      </p>

      <button
        @click="register"
        class="bg-gradient-to-r from-[#14b8a6] to-[#0891b2] text-white py-2.5 rounded-md font-semibold hover:shadow-md transition"
      >
        Créer un compte
      </button>

      <p class="text-sm text-center text-[#6b7280]">
        Déjà inscrit ?
        <NuxtLink to="/login" class="text-[#14b8a6] font-medium hover:underline">
          Se connecter
        </NuxtLink>
      </p>
    </div>
  </div>
</template>