<template>
  <div class="tg-shell">
    <AppSidebar />

    <div class="tg-main">
      <AppHeader />
      <main class="tg-content">
        <div class="tg-content-inner">
          <slot />
        </div>
      </main>
    </div>

    <AiAssistantFab />
  </div>
</template>