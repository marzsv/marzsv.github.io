/**
 * Contact Protection System
 * Encrypts/decrypts sensitive contact information using AES-256-GCM
 */

const ContactProtection = {
  // Derive encryption key from password using PBKDF2
  async deriveKey(password, salt) {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  },

  // Decrypt the contact data
  async decrypt(encryptedData, password) {
    try {
      // Parse the encrypted data (format: salt:iv:ciphertext, all base64)
      const parts = encryptedData.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
      }

      const salt = Uint8Array.from(atob(parts[0]), c => c.charCodeAt(0));
      const iv = Uint8Array.from(atob(parts[1]), c => c.charCodeAt(0));
      const ciphertext = Uint8Array.from(atob(parts[2]), c => c.charCodeAt(0));

      // Derive key from password
      const key = await this.deriveKey(password, salt);

      // Decrypt
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        ciphertext
      );

      return JSON.parse(new TextDecoder().decode(decrypted));
    } catch (e) {
      console.error('Decryption failed:', e);
      return null;
    }
  },

  // Encrypt contact data (for use in generator tool)
  async encrypt(data, password) {
    const encoder = new TextEncoder();

    // Generate random salt and IV
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Derive key
    const key = await this.deriveKey(password, salt);

    // Encrypt
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encoder.encode(JSON.stringify(data))
    );

    // Combine salt:iv:ciphertext as base64
    const saltB64 = btoa(String.fromCharCode(...salt));
    const ivB64 = btoa(String.fromCharCode(...iv));
    const ciphertextB64 = btoa(String.fromCharCode(...new Uint8Array(ciphertext)));

    return `${saltB64}:${ivB64}:${ciphertextB64}`;
  },

  // Show unlock modal
  showUnlockModal() {
    const modal = document.getElementById('contact-unlock-modal');
    if (modal) {
      modal.style.display = 'flex';
      document.getElementById('contact-password').focus();
    }
  },

  // Hide modal
  hideModal() {
    const modal = document.getElementById('contact-unlock-modal');
    if (modal) {
      modal.style.display = 'none';
      document.getElementById('contact-password').value = '';
      document.getElementById('contact-error').style.display = 'none';
    }
  },

  // Attempt to unlock contact info
  async unlock() {
    const password = document.getElementById('contact-password').value;
    const encryptedData = document.getElementById('encrypted-contact-data').value;
    const errorEl = document.getElementById('contact-error');

    if (!password) {
      errorEl.textContent = 'Please enter password';
      errorEl.style.display = 'block';
      return;
    }

    const data = await this.decrypt(encryptedData, password);

    if (data) {
      // Success - display the contact info
      this.displayContact(data);
      this.hideModal();

      // Store in session (optional - for page refreshes)
      sessionStorage.setItem('contact_unlocked', 'true');
      sessionStorage.setItem('contact_data', JSON.stringify(data));
    } else {
      errorEl.textContent = 'Incorrect password';
      errorEl.style.display = 'block';
    }
  },

  // Display decrypted contact info
  displayContact(data) {
    const container = document.getElementById('protected-contact');
    if (!container) return;

    let html = '';

    if (data.email) {
      html += `<li class="email"><i class="fa-solid fa-envelope"></i><a href="mailto:${data.email}">${data.email}</a></li>`;
    }

    if (data.phone) {
      html += `<li class="phone"><i class="fa-solid fa-phone"></i><a href="tel:${data.phone}">${data.phone}</a></li>`;
    }

    container.innerHTML = html;

    // Hide unlock button
    const unlockBtn = document.getElementById('unlock-contact-btn');
    if (unlockBtn) {
      unlockBtn.style.display = 'none';
    }
  },

  // Initialize - check if already unlocked in session
  init() {
    if (sessionStorage.getItem('contact_unlocked') === 'true') {
      const data = JSON.parse(sessionStorage.getItem('contact_data'));
      if (data) {
        this.displayContact(data);
      }
    }

    // Handle Enter key in password field
    const passwordInput = document.getElementById('contact-password');
    if (passwordInput) {
      passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.unlock();
        }
      });
    }
  }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => ContactProtection.init());
