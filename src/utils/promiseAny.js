/**
 * polyfill for `Promise.any` before node 15
 * @param {string} promises
 * @returns
 */
function promiseAny(promises) {
  return new Promise((resolve, reject) => {
    promises = Array.isArray(promises) ? promises : [];

    let len = promises.length;
    if (len === 0) {
      return reject(new Error('All promises were rejected'));
    }
    let errs = [];

    promises.forEach((promise) => {
      promise.then(
        (value) => resolve(value),
        (err) => {
          len--;
          errs.push(err);
          if (len === 0) {
            reject(errs);
          }
        }
      );
    });
  });
}

module.exports = promiseAny;
