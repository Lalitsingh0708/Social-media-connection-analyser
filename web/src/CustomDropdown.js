/**
 * CustomDropdown.js
 * A fully styled, searchable dropdown that replaces native <select> elements.
 * Matches the dark glassmorphism design of the app.
 *
 * Usage:
 *   const dd = new CustomDropdown('sel-friend-u', { placeholder: 'Pick a user…' });
 *   dd.setOptions([{ value: 'Alice', label: 'Alice', color: '#6C63FF', degree: 3 }]);
 *   dd.getValue()  → 'Alice' | ''
 *   dd.setValue('Bob')
 *   dd.onChange(val => console.log(val))
 */

export class CustomDropdown {
  /**
   * @param {string} containerId  - ID of the .cdd div in the HTML
   * @param {{ placeholder?: string }} opts
   */
  constructor(containerId, opts = {}) {
    this.container   = document.getElementById(containerId);
    this.placeholder = opts.placeholder || this.container.dataset.placeholder || 'Select…';
    this._value      = '';
    this._options    = [];
    this._listeners  = [];
    this._searchTerm = '';

    this._build();
    this._bindOutsideClick();
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  /** Returns the currently selected value string, or '' */
  getValue() { return this._value; }

  /** Programmatically select a value */
  setValue(val) {
    this._value = val;
    this._updateTrigger();
    this._updateActiveOption();
  }

  /** Register a change callback */
  onChange(fn) { this._listeners.push(fn); }

  /**
   * Repopulate the option list.
   * @param {{ value: string, label: string, color?: string, degree?: number }[]} options
   */
  setOptions(options) {
    this._options = options;
    // If current value no longer exists, reset
    if (this._value && !options.find(o => o.value === this._value)) {
      this._value = '';
    }
    this._renderOptions(this._searchTerm);
    this._updateTrigger();
  }

  // ─── Build DOM ─────────────────────────────────────────────────────────────

  _build() {
    this.container.innerHTML = `
      <div class="cdd-trigger" tabindex="0" role="button" aria-haspopup="listbox" aria-expanded="false">
        <div class="cdd-trigger-dot"></div>
        <span class="cdd-trigger-text">${this.placeholder}</span>
        <span class="cdd-chevron">▼</span>
      </div>
      <div class="cdd-list" role="listbox">
        <div class="cdd-list-inner">
          <div class="cdd-search">
            <div class="cdd-search-inner">
              <span class="cdd-search-icon">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="11" cy="11" r="7"/>
                  <line x1="16.5" y1="16.5" x2="22" y2="22"/>
                </svg>
              </span>
              <input class="cdd-search-input" type="text" placeholder="Search users…" autocomplete="off"/>
            </div>
          </div>
          <div class="cdd-options"></div>
        </div>
      </div>`;

    this._trigger      = this.container.querySelector('.cdd-trigger');
    this._triggerDot   = this.container.querySelector('.cdd-trigger-dot');
    this._triggerText  = this.container.querySelector('.cdd-trigger-text');
    this._list         = this.container.querySelector('.cdd-list');
    this._searchInput  = this.container.querySelector('.cdd-search-input');
    this._optionsEl    = this.container.querySelector('.cdd-options');

    // Toggle open/close on trigger click
    this._trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      this._isOpen() ? this._close() : this._open();
    });

    // Keyboard navigation on trigger
    this._trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._isOpen() ? this._close() : this._open(); }
      if (e.key === 'Escape') this._close();
    });

    // Search
    this._searchInput.addEventListener('input', () => {
      this._searchTerm = this._searchInput.value.toLowerCase();
      this._renderOptions(this._searchTerm);
    });

    // Stop list clicks from bubbling to outside-click handler
    this._list.addEventListener('click', e => e.stopPropagation());
  }

  // ─── Open / Close ──────────────────────────────────────────────────────────

  _open() {
    // Close all other open dropdowns
    document.querySelectorAll('.cdd.open').forEach(el => {
      if (el !== this.container) el.classList.remove('open');
    });
    this.container.classList.add('open');
    this._trigger.setAttribute('aria-expanded', 'true');
    this._searchInput.value = '';
    this._searchTerm = '';
    this._renderOptions('');
    // Focus search after animation frame
    requestAnimationFrame(() => this._searchInput.focus());
  }

  _close() {
    this.container.classList.remove('open');
    this._trigger.setAttribute('aria-expanded', 'false');
  }

  _isOpen() { return this.container.classList.contains('open'); }

  // ─── Render options ────────────────────────────────────────────────────────

  _renderOptions(filter = '') {
    const filtered = filter
      ? this._options.filter(o => o.label.toLowerCase().includes(filter))
      : this._options;

    if (filtered.length === 0) {
      this._optionsEl.innerHTML = `<div class="cdd-no-results">${filter ? 'No results for "' + filter + '"' : 'No users yet'}</div>`;
      return;
    }

    this._optionsEl.innerHTML = '';
    filtered.forEach(opt => {
      const el = document.createElement('div');
      el.className = 'cdd-option' + (opt.value === this._value ? ' active' : '');
      el.setAttribute('role', 'option');
      el.setAttribute('aria-selected', opt.value === this._value ? 'true' : 'false');
      el.dataset.value = opt.value;

      const initial = opt.label.charAt(0).toUpperCase();
      const color   = opt.color || '#6C63FF';
      const badge   = opt.degree !== undefined ? `<span class="cdd-option-badge">${opt.degree}🔗</span>` : '';

      el.innerHTML = `
        <div class="cdd-option-avatar" style="background:${color}">${initial}</div>
        <span class="cdd-option-name">${opt.label}</span>
        ${badge}`;

      el.addEventListener('click', () => this._select(opt));
      this._optionsEl.appendChild(el);
    });
  }

  _select(opt) {
    this._value = opt.value;
    this._updateTrigger(opt);
    this._updateActiveOption();
    this._close();
    this._listeners.forEach(fn => fn(opt.value));
  }

  // ─── Update trigger display ────────────────────────────────────────────────

  _updateTrigger(opt) {
    if (!opt && this._value) {
      opt = this._options.find(o => o.value === this._value);
    }
    if (opt && opt.value) {
      const color = opt.color || '#6C63FF';
      this._triggerDot.style.background = color;
      this._triggerDot.textContent = opt.label.charAt(0).toUpperCase();
      this._triggerDot.classList.add('visible');
      this._triggerText.textContent = opt.label;
      this._triggerText.classList.add('has-value');
    } else {
      this._triggerDot.classList.remove('visible');
      this._triggerText.textContent = this.placeholder;
      this._triggerText.classList.remove('has-value');
    }
  }

  _updateActiveOption() {
    this._optionsEl.querySelectorAll('.cdd-option').forEach(el => {
      const active = el.dataset.value === this._value;
      el.classList.toggle('active', active);
      el.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  }

  // ─── Outside click ─────────────────────────────────────────────────────────

  _bindOutsideClick() {
    if (CustomDropdown._outsideBound) return;
    CustomDropdown._outsideBound = true;
    document.addEventListener('click', () => {
      document.querySelectorAll('.cdd.open').forEach(el => el.classList.remove('open'));
    });
  }
}
