<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <h2>Paramètres</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-body">
        <div class="setting-row">
          <div class="setting-info">
            <span class="setting-title">Notifications</span>
            <span class="setting-desc">Recevoir des rappels avant les réunions</span>
          </div>
          <div class="toggle" :class="{ active: notificationsEnabled }" @click="toggleNotifications">
            <div class="toggle-circle"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SettingsModal',
  data() {
    return {
      notificationsEnabled: true
    }
  },
  methods: {
    toggleNotifications() {
      this.notificationsEnabled = !this.notificationsEnabled
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 16px;
  width: 420px;
  padding: 24px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.modal-header h2 {
  font-size: 1.3rem;
  font-weight: 600;
  color: #1a1a2e;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #666;
}

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
}

.setting-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.setting-title {
  font-weight: 500;
  color: #1a1a2e;
}

.setting-desc {
  font-size: 0.85rem;
  color: #888;
}

.toggle {
  width: 48px;
  height: 26px;
  background: #ddd;
  border-radius: 50px;
  cursor: pointer;
  position: relative;
  transition: background 0.3s;
}

.toggle.active {
  background: #0bc4b0;
}

.toggle-circle {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: left 0.3s;
}

.toggle.active .toggle-circle {
  left: 25px;
}
</style>
