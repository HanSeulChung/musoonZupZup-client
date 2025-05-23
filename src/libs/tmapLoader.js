export const loadTmap = (appKey) => {
  return new Promise((resolve, reject) => {
    if (window.Tmapv2 && typeof window.Tmapv2.LatLng === 'function') {
      resolve();
      return;
    }

    const existingScript = document.querySelector('script[src*="tmap/jsv2"]');
    if (existingScript) {
      existingScript.addEventListener('load', resolve);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://apis.openapi.sk.com/tmap/jsv2?version=1&appKey=${appKey}`;
    script.async = false; 
    script.onload = () => {
      const checkReady = () => {
        if (window.Tmapv2 && typeof window.Tmapv2.LatLng === 'function') {
          resolve();
        } else {
          setTimeout(checkReady, 100);
        }
      };
      checkReady();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
};
