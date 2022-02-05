'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "7ab42c67b692033dcdb30b1c26a4b716",
"assets/assets/fonts/AdventPro-Bold.ttf": "6af19d318fa7cd24e77d969fd05038ad",
"assets/assets/fonts/AdventPro-ExtraLight.ttf": "be0b0555e3bbbd289bd0e6dc4dff1dd3",
"assets/assets/fonts/AdventPro-Medium.ttf": "afe0201f8a582f8af0758bfae03059c5",
"assets/assets/fonts/AdventPro-Regular.ttf": "aa8009a40556288eefca3fd555dc54fa",
"assets/assets/fonts/AdventPro-SemiBold.ttf": "eed660b127c5467a30162447f6659386",
"assets/assets/fonts/BaiJamjuree-Bold.ttf": "259fb8f05fef8dd052def841337c0821",
"assets/assets/fonts/BaiJamjuree-ExtraLight.ttf": "acfab02a1409bbd023c5235ddbfb6750",
"assets/assets/fonts/BaiJamjuree-Medium.ttf": "e1bcfc1378f01158942dd154ecf846fa",
"assets/assets/fonts/BaiJamjuree-Regular.ttf": "3d6481eb06f967483c930db7e07313b4",
"assets/assets/fonts/BaiJamjuree-SemiBold.ttf": "34c9ae8b6671af44b1d7f4c7c4772d90",
"assets/assets/fonts/DaysOne-Regular.ttf": "2ee3184faa4447038f4e0645cc0ca73a",
"assets/assets/images/avatar-mobile.png": "fd0e02b137b7acf6336ec0d06130da53",
"assets/assets/images/avatar-web-2.png": "6e71a6a1510935de668ee20318e4a429",
"assets/assets/images/avatar-web.jpeg": "67b0c7545467ea8139d9297c6f6ba814",
"assets/assets/images/avatar-web.png": "9ba99f0da0df5e651dd98d64748a4739",
"assets/assets/images/figozo-market-logo.png": "af0ea3a249ecf537ab8a69fac520b317",
"assets/assets/images/figozo-merchant-logo.png": "c02c00cd1ed68a1781db7e72db4b4afe",
"assets/assets/images/ioled-logo.png": "276d79ce70cb8450fc9899231309e6a8",
"assets/FontManifest.json": "10691d71fdf296f6bede6bcae33b2b7c",
"assets/fonts/MaterialIcons-Regular.otf": "4e6447691c9509f7acdbf8a931a85ca1",
"assets/NOTICES": "04a1ac29eda539d1c9f9aabc8538a006",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"canvaskit/canvaskit.js": "43fa9e17039a625450b6aba93baf521e",
"canvaskit/canvaskit.wasm": "04ed3c745ff1dee16504be01f9623498",
"canvaskit/profiling/canvaskit.js": "f3bfccc993a1e0bfdd3440af60d99df4",
"canvaskit/profiling/canvaskit.wasm": "a9610cf39260f60fbe7524a785c66101",
"favicon.png": "323ee2527caff627faaf26298799e8e9",
"icons/Icon-192.png": "2c349ba128f8ae4e18a0aa6d4503c6e2",
"icons/Icon-512.png": "69d49d9d47de52b1baeba5e99e48eb15",
"icons/Icon-maskable-192.png": "c457ef57daa1d16f64b27b786ec2ea3c",
"icons/Icon-maskable-512.png": "301a7604d45b3e739efc881eb04896ea",
"index.html": "3cc1e96fe32f5baadb39efbd65462b12",
"/": "3cc1e96fe32f5baadb39efbd65462b12",
"main.dart.js": "99cb56be845006e7d344fe1e70f3549d",
"manifest.json": "8db129b54dcc0437bd0748915286be1e",
"README.md": "bc949ea893a9384070c31f083ccefd26",
"version.json": "80541c496e8a91cc2ffe892ff304f0fe"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
