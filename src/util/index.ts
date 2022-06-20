export const convertInstance = <T>(object: any, clazz: new () => T) => {
  const outInstance: T = new (clazz as any)();
  for (const k in object) {
    // eslint-disable-next-line no-prototype-builtins
    if (outInstance.hasOwnProperty(k)) {
      outInstance[k] = object[k];
    }
  }
  return outInstance;
};
