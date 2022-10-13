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

/** Fake an API Call that fails for the first 8 attempts
* and resolves on its 8th attempt.
*/
function generateFailableAPICall() {
  let counter = 1;
  return function () {
    if (counter < maxRetries) {
      counter++;
      return Promise.reject(new Error("Simulated error"));
    } else {
      return Promise.resolve({ status: "ok" });
    }
  };
}

function updateUI(text) {
  const appNode = document.getElementById("app");
  appNode.innerHTML = `${appNode.innerHTML}<br/>${text}`;
}

/*** Testing our Retry with Exponential Backoff */
async function test() {
  const apiCall = generateFailableAPICall();
  const result = await retry(
    apiCall,
    (_retryAttempt, timeToWait) => {
      console.log("on retry called...");
      console.log(`waiting for ${timeToWait}ms...`);
      updateUI(`Waiting for ${timeToWait}ms before next attempt`);
    },
    8
  );
  updateUI(`Result: ${JSON.stringify(result)}`);
}

document.getElementById("btn").addEventListener("click", function () {
  test();
});  


