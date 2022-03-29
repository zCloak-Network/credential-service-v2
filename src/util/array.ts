export function getOne(obj: any) {
  if (Array.isArray(obj) && obj.length > 0) {
    return obj[0];
  }
  return obj;
}
