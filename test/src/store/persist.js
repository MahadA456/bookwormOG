export default function persistState(debounceTime = 500) {
  let timeout;

  return store => {
    const savedState = sessionStorage.getItem('vuex-state');
    if (savedState) {
      store.replaceState(JSON.parse(savedState));
    }

    store.subscribe((mutation, state) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        sessionStorage.setItem('vuex-state', JSON.stringify(state));
      }, debounceTime);
    });
  };
}
