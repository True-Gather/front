<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">

      <!-- Header -->
      <div class="modal-header">
        <div class="modal-title">
          <div class="modal-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <h2>Créer un groupe</h2>
        </div>
        <button class="close-btn" @click="$emit('close')">✖</button>
      </div>

      <!-- Body -->
      <div class="modal-body">

        <!-- Nom du groupe -->
        <div class="field">
          <label>Nom du groupe</label>
          <input v-model="groupName" type="text" placeholder="Ex: Équipe Design" />
        </div>

        <!-- Description -->
        <div class="field">
          <label>Description <span class="optional">(optionnel)</span></label>
          <textarea v-model="description" placeholder="Description du groupe..."></textarea>
        </div>

        <!-- Membres par email -->
        <div class="field">
          <label>Ajouter des membres</label>
          <div class="email-input-row">
            <input
              v-model="emailInput"
              type="email"
              placeholder="exemple@email.com"
              @keyup.enter="addEmail"
            />
            <button class="add-btn" @click="addEmail">+</button>
          </div>
          <div class="tags" v-if="emails.length">
            <span class="tag" v-for="(email, i) in emails" :key="i">
              {{ email }}
              <span class="tag-remove" @click="removeEmail(i)">×</span>
            </span>
          </div>
        </div>
<!-- Photo du groupe -->
<div class="field">
  <label>Photo du groupe <span class="optional">(optionnel)</span></label>
  <div class="photo-upload" @click="$refs.photoInput.click()">
    <div v-if="photoPreview" class="photo-preview">
      <img :src="photoPreview" alt="photo du groupe" />
      <button class="photo-remove" @click.stop="removePhoto">×</button>
    </div>
    <div v-else class="photo-placeholder">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
        <circle cx="9" cy="9" r="2"></circle>
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
      </svg>
      <span>Cliquer pour ajouter une photo</span>
    </div>
  </div>
  <input ref="photoInput" type="file" accept="image/*" style="display:none" @change="handlePhoto" />
</div>

      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <button class="cancel-btn" @click="$emit('close')">Annuler</button>
        <button class="start-btn" @click="createGroup">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          Créer le groupe
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
const photoPreview = ref(null)
const photoFile = ref(null)

function handlePhoto(e) {
  const file = e.target.files[0]
  if (!file) return
  photoFile.value = file
  photoPreview.value = URL.createObjectURL(file)
}

function removePhoto() {
  photoPreview.value = null
  photoFile.value = null
}
import { ref } from 'vue'
const emit = defineEmits(['close'])
const groupName = ref('')
const description = ref('')
const emailInput = ref('')
const emails = ref([])

function addEmail() {
  const val = emailInput.value.trim()
  if (val && !emails.value.includes(val)) {
    emails.value.push(val)
  }
  emailInput.value = ''
}

function removeEmail(i) {
  emails.value.splice(i, 1)
}

function createGroup() {
  console.log({
    name: groupName.value,
    description: description.value,
    members: emails.value
  })
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 20px;
  width: 480px;
  max-width: 95vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

/* Header */
.modal-header {
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.photo-upload {
  cursor: pointer;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  overflow: hidden;
  transition: border-color 0.2s;
}

.photo-upload:hover {
  border-color: #14b8a6;
}

.photo-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 28px;
  color: #9ca3af;
  font-size: 13px;
}

.photo-preview {
  position: relative;
  width: 100%;
  height: 140px;
}

.photo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-remove {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0,0,0,0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.photo-remove:hover {
  background: #ef4444;
}


.modal-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #14b8a6, #0891b2);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.modal-title h2 {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #6b7280;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
}

/* Body */
.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.optional {
  font-weight: 400;
  color: #9ca3af;
  font-size: 13px;
}

input[type="text"],
input[type="email"],
textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  transition: border 0.2s;
  background: white;
  font-family: inherit;
  box-sizing: border-box;
}

input[type="text"]:focus,
input[type="email"]:focus,
textarea:focus {
  border-color: #14b8a6;
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
}

textarea {
  resize: vertical;
  min-height: 80px;
}

.email-input-row {
  display: flex;
  gap: 8px;
}

.email-input-row input {
  flex: 1;
}

.add-btn {
  background: linear-gradient(135deg, #14b8a6, #0891b2);
  color: white;
  border: none;
  border-radius: 10px;
  width: 40px;
  font-size: 20px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.add-btn:hover {
  opacity: 0.85;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  background: #ccfbf1;
  color: #0f766e;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.tag-remove {
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  color: #0f766e;
}

.tag-remove:hover {
  color: #ef4444;
}

/* Footer */
.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cancel-btn {
  background: none;
  border: 1px solid #d1d5db;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background: #f3f4f6;
}

.start-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #14b8a6, #0891b2);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.4);
}

.start-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(20, 184, 166, 0.5);
}
</style>
