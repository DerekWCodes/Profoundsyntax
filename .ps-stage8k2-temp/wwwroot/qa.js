window.ps8k2 = {
  indexedDbBlocked: function () {
    return new Promise(function (resolve) {
      try {
        var request = indexedDB.open("ps-stage8k2-denial-probe", 1);
        request.onupgradeneeded = function () {};
        request.onerror = function () {
          var name = request.error && request.error.name ? request.error.name : "Error";
          resolve({ pass: true, detail: "indexedDB.open() blocked: " + name });
        };
        request.onsuccess = function () {
          try { request.result.close(); indexedDB.deleteDatabase("ps-stage8k2-denial-probe"); } catch (_) {}
          resolve({ pass: false, detail: "IndexedDB opened unexpectedly" });
        };
      } catch (error) {
        resolve({ pass: true, detail: "indexedDB.open() blocked: " + (error && error.name ? error.name : "SecurityError") });
      }
    });
  },
  workerBlocked: function () {
    return new Promise(function (resolve) {
      var url = "";
      try {
        url = URL.createObjectURL(new Blob(["postMessage('alive')"], { type: "text/javascript" }));
        var worker = new Worker(url);
        var settled = false;
        var finish = function (pass, detail) {
          if (settled) return;
          settled = true;
          try { worker.terminate(); } catch (_) {}
          try { URL.revokeObjectURL(url); } catch (_) {}
          resolve({ pass: pass, detail: detail });
        };
        worker.onmessage = function () { finish(false, "Worker executed unexpectedly"); };
        worker.onerror = function () { finish(true, "Worker start blocked by runtime policy/CSP"); };
        setTimeout(function () { finish(true, "Worker did not execute under runtime policy/CSP"); }, 350);
      } catch (error) {
        if (url) { try { URL.revokeObjectURL(url); } catch (_) {} }
        resolve({ pass: true, detail: "Worker constructor blocked: " + (error && error.name ? error.name : "SecurityError") });
      }
    });
  },
  threadedUnavailable: function () {
    var sab = typeof SharedArrayBuffer;
    var isolated = self.crossOriginIsolated === true;
    return { pass: sab === "undefined" && !isolated, detail: "SharedArrayBuffer=" + sab + " · crossOriginIsolated=" + isolated };
  }
};
