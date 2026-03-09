/* ─────────────────────────────────────────────────────────────────
   WeddingCard V2 – script.js
   ───────────────────────────────────────────────────────────────── */

const opening = document.getElementById("opening");
const content = document.getElementById("content");

/* ── Ouvrir l'invitation ── */
const showContent = () => {
  if (!opening) return;
  
  // Hide envelope
  opening.classList.add("opening--hide");

  setTimeout(() => {
    content.setAttribute("aria-hidden", "false");
    content.classList.add("fade-in");
    document.body.classList.remove("opening-active");
    if (opening.parentNode) opening.parentNode.removeChild(opening);
  }, 900);
};

if (opening) opening.addEventListener("click", showContent);

/* ── RSVP : Modal toggle ── */
const rsvpModal = document.getElementById("rsvp-modal-overlay");
const openRsvpBtn = document.getElementById("open-rsvp-btn");
const closeRsvpBtn = document.getElementById("close-rsvp-btn");
const overlayNameInput = document.getElementById("overlay-name-input");

/* ── Guest Count Modal ── */
const guestCountOverlay = document.getElementById("guest-count-overlay");
const guestCountDisplay = document.getElementById("guest-count-display");
const guestMinusBtn = document.getElementById("guest-minus");
const guestPlusBtn = document.getElementById("guest-plus");
const guestConfirmBtn = document.getElementById("guest-confirm-btn");
const closeGuestBtn = document.getElementById("close-guest-btn");
let guestCount = 1;

if (guestMinusBtn) {
  guestMinusBtn.addEventListener("click", () => {
    if (guestCount > 1) {
      guestCount--;
      guestCountDisplay.textContent = guestCount;
    }
  });
}

if (guestPlusBtn) {
  guestPlusBtn.addEventListener("click", () => {
    if (guestCount < 20) {
      guestCount++;
      guestCountDisplay.textContent = guestCount;
    }
  });
}

if (closeGuestBtn && guestCountOverlay) {
  closeGuestBtn.addEventListener("click", () => {
    guestCountOverlay.classList.remove("is-open");
    // Re-enable confirm button
    if (openRsvpBtn) {
      openRsvpBtn.style.pointerEvents = "auto";
      openRsvpBtn.style.opacity = "1";
    }
  });
  guestCountOverlay.addEventListener("click", (e) => {
    if (e.target === guestCountOverlay) {
      guestCountOverlay.classList.remove("is-open");
      if (openRsvpBtn) {
        openRsvpBtn.style.pointerEvents = "auto";
        openRsvpBtn.style.opacity = "1";
      }
    }
  });
}

/* ── Firebase submit helper ── */
function submitToFirebase(name, isPresent, guestsNum) {
  if (typeof firebase === 'undefined') return;
  const db = firebase.firestore();
  db.collection("guests").add({
    name: name,
    present: isPresent,
    guests: guestsNum,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  })
  .then(() => {
    const successSlide = document.getElementById('rsvp-success-slide');
    const successTitle = document.getElementById('rsvp-slide-title');
    const successText = document.getElementById('rsvp-slide-text');
    const calBtn = document.getElementById('rsvp-slide-cal');
    const closeBtn = document.getElementById('rsvp-slide-close');

    // Close guest modal if open
    if (guestCountOverlay) guestCountOverlay.classList.remove("is-open");

    if (successSlide) {
      if (isPresent) {
        successTitle.textContent = "Merci pour votre confirmation !";
        successText.textContent = `Nous avons hâte de célébrer ce moment avec vous, ${name.split(' ')[0]}.`;
        if (calBtn) calBtn.style.display = 'inline-flex';
      } else {
        successTitle.textContent = "C'est noté !";
        successText.textContent = `Merci de nous avoir prévenus, ${name.split(' ')[0]}. À très bientôt !`;
        if (calBtn) calBtn.style.display = 'none';
      }
      successSlide.style.pointerEvents = 'auto';
      successSlide.style.opacity = '1';

      const hideSlide = () => {
        successSlide.style.opacity = '0';
        successSlide.style.pointerEvents = 'none';
      };
      if (closeBtn) closeBtn.onclick = hideSlide;
      setTimeout(hideSlide, 5000);
    }
  })
  .catch((error) => {
    console.error("Error:", error);
    alert("⚠️ Erreur réseau, veuillez réessayer.");
    if (openRsvpBtn) {
      openRsvpBtn.style.pointerEvents = "auto";
      openRsvpBtn.style.opacity = "1";
    }
  });
}

/* ── Confirm button click ── */
if (openRsvpBtn) {
  openRsvpBtn.addEventListener("click", () => {
    const name = overlayNameInput ? overlayNameInput.value.trim() : "";
    const overlayPresence = document.querySelector('input[name="overlay-presence"]:checked');

    if (!name) {
      alert("Merci d'entrer votre nom & prénom.");
      if (overlayNameInput) overlayNameInput.focus();
      return;
    }
    if (!overlayPresence) {
      alert("Merci de sélectionner si vous serez présent(e).");
      return;
    }

    const presenceValue = overlayPresence.value;
    openRsvpBtn.style.pointerEvents = "none";
    openRsvpBtn.style.opacity = "0.5";

    if (presenceValue === "yes") {
      // Show guest count popup
      guestCount = 1;
      if (guestCountDisplay) guestCountDisplay.textContent = guestCount;
      if (guestCountOverlay) guestCountOverlay.classList.add("is-open");

      // When user confirms guest count
      if (guestConfirmBtn) {
        guestConfirmBtn.onclick = () => {
          guestConfirmBtn.disabled = true;
          guestConfirmBtn.textContent = "Envoi en cours...";
          submitToFirebase(name, true, guestCount);
        };
      }
    } else {
      // No → submit directly
      submitToFirebase(name, false, 0);
    }
  });
}

if (closeRsvpBtn && rsvpModal) {
  closeRsvpBtn.addEventListener("click", () => {
    rsvpModal.classList.remove("is-open");
  });
  
  // Close on backdrop click
  rsvpModal.addEventListener("click", (e) => {
    if (e.target === rsvpModal) {
      rsvpModal.classList.remove("is-open");
    }
  });
}

/* ── RSVP : toggle champs présence ── */
const radios = document.querySelectorAll("input[name='presence']");
radios.forEach(r => {
  r.addEventListener("change", () => {
    const yesBlock = document.querySelector(".rsvp-yes");
    const guestsInput = document.querySelector("input[name='guests']");
    if (!yesBlock) return;

    if (r.value === "yes") {
      yesBlock.style.display = "grid";
      if (guestsInput) guestsInput.required = true;
    } else {
      yesBlock.style.display = "none";
      if (guestsInput) guestsInput.required = false;
    }
  });
});

/* ── Firebase Initialization ── */
const firebaseConfig = {
  apiKey: "AIzaSyC6CVx8bEiB3ObuNKybFHPHkSDU9YBcHkI",
  authDomain: "mariage-rayan.firebaseapp.com",
  projectId: "mariage-rayan",
  storageBucket: "mariage-rayan.firebasestorage.app",
  messagingSenderId: "901117407492",
  appId: "1:901117407492:web:4af8079ecf4d9c1770e051",
  measurementId: "G-1RYMRCBZ3S"
};

if (typeof firebase !== 'undefined' && !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

/* ── RSVP : soumission ── */
const rsvpForm = document.getElementById("rsvp-form");
const rsvpSubmit = document.getElementById("rsvp-submit");

if (rsvpForm) {
  rsvpForm.addEventListener("submit", e => {
    e.preventDefault();
    if (rsvpSubmit) {
      rsvpSubmit.disabled = true;
      rsvpSubmit.textContent = "Envoi en cours...";
    }

    const nameInput = rsvpForm.querySelector('input[type="text"]').value;
    const presenceInput = rsvpForm.querySelector('input[name="presence"]:checked').value;

    let guestsCount = 0;
    if (presenceInput === "yes") {
      const guestsStr = rsvpForm.querySelector('input[name="guests"]').value;
      if (guestsStr) guestsCount = parseInt(guestsStr, 10);
    }

    if (typeof firebase !== 'undefined') {
      const db = firebase.firestore();
      db.collection("guests").add({
        name: nameInput,
        present: presenceInput === "yes",
        guests: guestsCount,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      })
        .then(() => {
          if (rsvpModal) {
            rsvpModal.classList.remove("is-open");
          }

          const successSlide = document.getElementById('rsvp-success-slide');
          const successTitle = document.getElementById('rsvp-slide-title');
          const successText = document.getElementById('rsvp-slide-text');
          const calBtn = document.getElementById('rsvp-slide-cal');
          const closeBtn = document.getElementById('rsvp-slide-close');

          if (successSlide && rsvpForm) {
            if (presenceInput === "yes") {
              successTitle.textContent = "Merci pour votre confirmation !";
              successText.textContent = `Nous avons hâte de célébrer ce moment avec vous, ${nameInput.split(' ')[0]}.`;
              if (calBtn) calBtn.style.display = 'inline-flex';
            } else {
              successTitle.textContent = "C'est noté !";
              successText.textContent = `Merci de nous avoir prévenus, ${nameInput.split(' ')[0]}. À très bientôt !`;
              if (calBtn) calBtn.style.display = 'none';
            }

            successSlide.style.pointerEvents = 'auto';
            successSlide.style.opacity = '1';

            if (rsvpSubmit) {
              rsvpSubmit.textContent = "✓ Confirmé";
            }

            const hideSlide = () => {
              successSlide.style.opacity = '0';
              successSlide.style.pointerEvents = 'none';

              if (rsvpForm.parentNode) {
                rsvpForm.parentNode.innerHTML = `
                  <div style="text-align: center; padding: 60px 20px;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--ink)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width: 40px; height: 40px; margin-bottom: 16px;">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <h2 style="font-family: var(--font-display); font-size: 24px; color: var(--ink); margin-bottom: 8px;">C'est noté !</h2>
                    <p style="font-family: var(--font-body); font-size: 16px; color: var(--taupe);">Votre réponse a bien été enregistrée. Merci.</p>
                  </div>
                `;
              }
            };

            if (closeBtn) closeBtn.onclick = hideSlide;
            setTimeout(hideSlide, 5000);
          }
        })
        .catch((error) => {
          console.error("Error adding document: ", error);
          if (rsvpSubmit) {
            rsvpSubmit.textContent = "⚠️ Erreur réseau, réessayez.";
            rsvpSubmit.disabled = false;
          }
        });
    }
  });
}

// Fallback just in case
document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', (e) => {
        if(e.target && e.target.id === 'open-rsvp-btn' || e.target.classList.contains('overlay-btn-confirmer')){
            // No longer opens modal — handled by direct submit above
        }
    });
});

/* ── Countdown Timer ── */
(function() {
  const weddingDate = new Date('2026-05-09T10:00:00');
  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minsEl = document.getElementById('cd-mins');
  const secsEl = document.getElementById('cd-secs');

  if (!daysEl) return;

  function update() {
    const now = new Date();
    const diff = weddingDate - now;

    if (diff <= 0) {
      daysEl.textContent = '0';
      hoursEl.textContent = '0';
      minsEl.textContent = '0';
      secsEl.textContent = '0';
      return;
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    daysEl.textContent = d;
    hoursEl.textContent = h;
    minsEl.textContent = m;
    secsEl.textContent = s < 10 ? '0' + s : s;
  }

  update();
  setInterval(update, 1000);
})();
