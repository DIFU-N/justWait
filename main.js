function waitFor(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function retry(promise, onRetry, maxRetries) {
  let timeToWait = 1;
  async function retryWithBackoff(retries) {
      try {
      if (retries > 0) {
          // console.log(retries);
          timeToWait = 2 ** retries * 100;
          console.log(`waiting for ${timeToWait}ms...`);
          await waitFor(timeToWait);
      }
      return await promise();
      } catch (e) {
      if (retries < maxRetries) {
          // console.log(retries);
          onRetry(retries + 1, timeToWait);
          return retryWithBackoff(retries + 1);
      } else {
          console.warn('Max retries reached. Bubbling the error up')
          throw e;
      }
      }
  }

  return retryWithBackoff(0);
}