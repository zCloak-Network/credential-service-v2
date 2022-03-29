export function isEmpty(str: string) {
  return (
    str === undefined ||
    str === null ||
    str === '' ||
    str === 'undefined' ||
    str === 'null'
  );
}
