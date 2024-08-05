<!-- src/App.vue -->
<template>
  <RouterView />
</template>

<script>
export default {
  name: 'App',
  created() {
    this.$store.dispatch('autoLogin');
  }
}
</script>

<style>
/* Global styles if any */
</style>
