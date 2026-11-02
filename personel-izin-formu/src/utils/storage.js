// localStorage that never throws (private windows, blocked storage).
export const storage = {
  get(key) {
    try {
      return window.localStorage.getItem(`t2-leave:${key}`);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      if (value == null) window.localStorage.removeItem(`t2-leave:${key}`);
      else window.localStorage.setItem(`t2-leave:${key}`, value);
    } catch {
      // Storage unavailable: the value just isn't remembered.
    }
  },
};
