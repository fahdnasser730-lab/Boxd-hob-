/* Firebase bridge for Itz_fahd_YT Ultimate Code Hub.
   Accounts + community posts use Firebase. Media uploads are intentionally disabled until Storage is configured. */
(function () {
  const firebaseConfig = {
    apiKey: "AIzaSyAsXK1WhopuUKme12V7w1Fj6R7n7jMmbzA",
    authDomain: "itz-fahd-yt-hub.firebaseapp.com",
    projectId: "itz-fahd-yt-hub",
    storageBucket: "itz-fahd-yt-hub.firebasestorage.app",
    messagingSenderId: "608494004063",
    appId: "1:608494004063:web:855c054087e1b957d2f8ea",
    measurementId: "G-GTV2J53VS2"
  };
  if (!window.firebase) { alert('Firebase SDK failed to load. Check your internet connection.'); return; }
  if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();
  let currentProfile = null;
  let postsUnsubscribe = null;
  const form = document.getElementById('authForm');

  function notify(message) {
    const el = document.getElementById('toast');
    if (el) { el.textContent = message; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 3200); }
    else alert(message);
  }
  function safeRender() { if (typeof render === 'function') render(); }
  function addLocalProfile(profile) {
    const old = state.users.find(u => u.uid === profile.uid || u.name.toLowerCase() === profile.name.toLowerCase());
    if (old) Object.assign(old, { name: profile.name, logo: profile.logo || 'channel-avatar.png', uid: profile.uid });
    else state.users.push({ name: profile.name, logo: profile.logo || 'channel-avatar.png', uid: profile.uid, time: profile.time || Date.now() });
    current = profile.name;
    currentProfile = profile;
    localStorage.setItem('itzfahd_hub_v2_session', profile.name);
  }
  async function getOrCreateProfile(firebaseUser, requestedName) {
    const ref = db.collection('users').doc(firebaseUser.uid);
    const snap = await ref.get();
    if (snap.exists) return { uid: firebaseUser.uid, ...snap.data() };
    const name = (requestedName || (typeof current === 'string' && current) || firebaseUser.email.split('@')[0]).trim();
    if (!/^[\w .-]{3,24}$/.test(name)) throw new Error('Username must be 3–24 letters, numbers, spaces, _ . or -.');
    const profile = { name, email: firebaseUser.email, logo: 'channel-avatar.png', createdAt: firebase.firestore.FieldValue.serverTimestamp() };
    await ref.set(profile);
    return { uid: firebaseUser.uid, name, logo: profile.logo, email: firebaseUser.email, time: Date.now() };
  }
  async function loadProfileAndPosts(firebaseUser, requestedName) {
    if (!firebaseUser) {
      currentProfile = null;
      current = '';
      localStorage.removeItem('itzfahd_hub_v2_session');
      if (postsUnsubscribe) { postsUnsubscribe(); postsUnsubscribe = null; }
      state.users = state.users.filter(u => !u.uid);
      safeRender();
      return;
    }
    try {
      const profile = await getOrCreateProfile(firebaseUser, requestedName);
      addLocalProfile(profile);
      if (postsUnsubscribe) postsUnsubscribe();
      postsUnsubscribe = db.collection('posts').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
        state.posts = snapshot.docs.map(doc => {
          const d = doc.data();
          return { id: doc.id, author: d.author || 'Player', authorUid: d.authorUid || '', text: d.text || '', link: d.link || '', media: '', mediaType: '', likes: d.likes || 0, comments: Array.isArray(d.comments) ? d.comments : [], time: d.createdAt && d.createdAt.toMillis ? d.createdAt.toMillis() : Date.now() };
        });
        safeRender();
      }, err => notify('Could not load shared posts: ' + err.message));
      safeRender();
    } catch (err) {
      notify('Firebase profile error: ' + err.message);
    }
  }

  // Firebase Authentication: the form now requires email + password.
  if (form) form.addEventListener('submit', async function (event) {
    event.preventDefault(); event.stopImmediatePropagation();
    const name = document.getElementById('authName').value.trim();
    const email = document.getElementById('authEmail').value.trim();
    const password = document.getElementById('authPass').value;
    if (!/^[\w .-]{3,24}$/.test(name)) return notify('Username must be 3–24 letters, numbers, spaces, _ . or -.');
    if (!email) return notify('Enter your email address.');
    try {
      let credential;
      try {
        credential = await auth.createUserWithEmailAndPassword(email, password);
      } catch (err) {
        if (err.code === 'auth/email-already-in-use') credential = await auth.signInWithEmailAndPassword(email, password);
        else throw err;
      }
      const profileRef = db.collection('users').doc(credential.user.uid);
      const profileSnap = await profileRef.get();
      if (!profileSnap.exists) {
        await profileRef.set({ name, email, logo: 'channel-avatar.png', createdAt: firebase.firestore.FieldValue.serverTimestamp() });
      }
      const profile = { uid: credential.user.uid, ...(await profileRef.get()).data() };
      addLocalProfile(profile);
      if (typeof modal === 'function') modal('authModal', false);
      safeRender();
      notify('Signed in with Firebase successfully.');
    } catch (err) {
      const messages = {
        'auth/invalid-email': 'Email address is invalid.',
        'auth/weak-password': 'Choose a password with at least 6 characters.',
        'auth/invalid-credential': 'Email or password is incorrect.',
        'auth/network-request-failed': 'Network error. Check your connection.',
        'permission-denied': 'Firestore rules are not published yet. Apply the provided rules first.'
      };
      notify(messages[err.code] || err.message || 'Could not sign in.');
    }
  }, true);

  // Replace the local-only post form behavior with a Firestore write.
  document.addEventListener('submit', async function (event) {
    const f = event.target;
    if (!f || f.id !== 'postForm') return;
    event.preventDefault(); event.stopImmediatePropagation();
    const firebaseUser = auth.currentUser;
    if (!firebaseUser || !currentProfile) return notify('Sign in with your email first.');
    const text = f.elements.text.value.trim();
    const link = f.elements.link.value.trim();
    if (!text && !link) return notify('Write a message or add a link.');
    if (f.elements.media.files && f.elements.media.files.length) return notify('Image/video uploads are not connected yet. For now, publish text and links; we will add Storage next.');
    if (link && !/^https?:\/\//i.test(link)) return notify('Use a valid http/https link.');
    try {
      await db.collection('posts').add({ author: currentProfile.name, authorUid: firebaseUser.uid, text, link, likes: 0, comments: [], createdAt: firebase.firestore.FieldValue.serverTimestamp() });
      f.reset(); notify('Post saved to Firebase and shared with everyone.');
    } catch (err) {
      notify('Post was not saved: ' + err.message + '. Check Firestore rules.');
    }
  }, true);

  // Use Firebase sign-out, not only the local session flag.
  const signOut = document.getElementById('signOut');
  if (signOut) signOut.onclick = async function () {
    try { await auth.signOut(); if (typeof modal === 'function') modal('authModal', false); notify('Signed out.'); }
    catch (err) { notify(err.message); }
  };

  auth.onAuthStateChanged(firebaseUser => loadProfileAndPosts(firebaseUser, null));
})();
