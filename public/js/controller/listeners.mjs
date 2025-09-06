// public/js/controller/listeners.mjs
export function createListenerBag() {
  const offs = [];
  const on = (target, type, handler, opts) => {
    target.addEventListener(type, handler, opts);
    offs.push(() => target.removeEventListener(type, handler, opts));
  };
  const destroyAll = () => { while (offs.length) offs.pop()(); };
  return { on, destroyAll };
}
