<template>
  <div class="notifications-overlay" @click.self="$emit('close')">
    <div class="notifications-panel">
      <div class="notifications-header">
        <h2>Notifications</h2>
        <button class="close-btn" @click="$emit('close')">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="notifications-list">
        <!-- Invitation à rejoindre une réunion -->
        <div class="notification-item unread">
          <div class="notif-icon meeting">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <video x="2" y="2" width="20" height="20"></video>
              <path d="M22 8s-4 2-4 6 4 6 4 6"></path>
              <rect x="2" y="6" width="14" height="12" rx="2"></rect>
            </svg>
          </div>
          <div class="notif-content">
            <p class="notif-text"><span class="notif-name">Alexandre</span> vous invite à rejoindre <span class="notif-name">Réunion design</span></p>
            <span class="notif-time">Il y a 2 min</span>
            <div class="notif-actions">
              <button class="notif-btn accept">Rejoindre</button>
              <button class="notif-btn decline">Refuser</button>
            </div>
          </div>
        </div>

        <!-- Nouveau message dans un groupe -->
        <div class="notification-item unread">
          <div class="notif-icon message">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <div class="notif-content">
            <p class="notif-text"><span class="notif-name">Sarah</span> a envoyé un message dans <span class="notif-name">Équipe Dev</span></p>
            <span class="notif-time">Il y a 15 min</span>
          </div>
        </div>

        <!-- Invitation groupe -->
        <div class="notification-item">
          <div class="notif-icon group">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div class="notif-content">
            <p class="notif-text"><span class="notif-name">Marc</span> vous a ajouté au groupe <span class="notif-name">Projet Alpha</span></p>
            <span class="notif-time">Il y a 1h</span>
            <div class="notif-actions">
              <button class="notif-btn accept">Accepter</button>
              <button class="notif-btn decline">Refuser</button>
            </div>
          </div>
        </div>

        <!-- Réunion bientôt -->
        <div class="notification-item">
          <div class="notif-icon reminder">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div class="notif-content">
            <p class="notif-text">Rappel : <span class="notif-name">Standup quotidien</span> commence dans 10 minutes</p>
            <span class="notif-time">Il y a 2h</span>
          </div>
        </div>
      </div>

      <div class="notifications-footer">
        <button class="mark-all-read">Tout marquer comme lu</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineEmits(['close'])
</script>

<style scoped>
.notifications-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  z-index: 1000;
  padding: 70px 20px 0 0;
}

.notifications-panel {
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  width: 380px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.notifications-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  background: #ffffff;
  z-index: 1;
}

.notifications-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: rgba(0, 0, 0, 0.4);
  padding: 6px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  color: #111827;
  background: rgba(0, 0, 0, 0.06);
}

.notifications-list {
  padding: 8px 0;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  transition: background 0.2s;
  position: relative;
}

.notification-item:hover {
  background: rgba(0, 0, 0, 0.03);
}

.notification-item.unread {
  background: rgba(99, 102, 241, 0.05);
}

.notification-item.unread::before {
  content: '';
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #6366f1;
}

.notif-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notif-icon.meeting { background: rgba(99, 102, 241, 0.12); color: #6366f1; }
.notif-icon.message { background: rgba(16, 185, 129, 0.12); color: #10b981; }
.notif-icon.group   { background: rgba(245, 158, 11, 0.12); color: #f59e0b; }
.notif-icon.reminder { background: rgba(239, 68, 68, 0.12); color: #ef4444; }

.notif-content {
  flex: 1;
}

.notif-text {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.65);
  margin: 0 0 4px 0;
  line-height: 1.4;
}

.notif-name {
  color: #111827;
  font-weight: 600;
}

.notif-time {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.35);
}

.notif-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.notif-btn {
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.notif-btn.accept {
  background: #6366f1;
  color: #fff;
}

.notif-btn.accept:hover {
  background: #5254cc;
}

.notif-btn.decline {
  background: rgba(0, 0, 0, 0.07);
  color: rgba(0, 0, 0, 0.6);
}

.notif-btn.decline:hover {
  background: rgba(0, 0, 0, 0.12);
}

.notifications-footer {
  padding: 16px 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  text-align: center;
}

.mark-all-read {
  background: none;
  border: none;
  color: #6366f1;
  font-size: 14px;
  cursor: pointer;
  font-weight: 500;
  transition: opacity 0.2s;
}

.mark-all-read:hover {
  opacity: 0.7;
}
</style>
