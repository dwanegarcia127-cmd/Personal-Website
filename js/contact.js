/*
  DWANE'S CONTACT PAGE — EASY SETUP
  ---------------------------------------------------------------
  Fill only the values you want to make public on your website.
  Leave a value as "" to keep that contact card inactive.

  Examples (NOT your real details):
    email: "hello@example.com"
    github: "https://github.com/your-username"

  This is a static HTML website. It has no server or message database.
  When an email is configured, the form opens the visitor's email app.
  Otherwise, the form copies a formatted message to the clipboard.
*/

const DWANE_CONTACT = {
    email: "dwanegarcia127@gmail.com",
    institutionalEmail: "0326-1502@lspu.edu.ph",
    github: "https://github.com/dwanegarcia127-cmd",
    facebook: "https://www.facebook.com/dwane.garcia.142311/",
    instagram: "https://www.instagram.com/garciadwane/",
    linkedin: "https://www.linkedin.com/in/dwane-garcia-96711342b/"
};

(function () {
    'use strict';

    function getPublicUrl(key) {
        const value = String(DWANE_CONTACT[key] || '').trim();
        if (!value) return '';
        if (key === 'email' || key === 'institutionalEmail') {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
                ? 'mailto:' + value : '';
        }
        try {
            const url = new URL(value);
            return url.protocol === 'https:' ? url.href : '';
        } catch (_) {
            return '';
        }
    }

    document.querySelectorAll('[data-contact-link]').forEach(function (card) {
        const key = card.dataset.contactLink;
        const url = getPublicUrl(key);
        const action = card.querySelector('.ct-channel-action');
        if (!url) return;
        card.href = url;
        card.removeAttribute('aria-disabled');
        card.classList.add('is-available');
        if (key !== 'email' && key !== 'institutionalEmail') {
            card.target = '_blank';
            card.rel = 'noopener noreferrer';
        }
        if (action) action.textContent = key === 'email' ? 'Write an email ↗' : key === 'institutionalEmail' ? 'For school matters ↗' : 'Visit my profile ↗';
    });

    const form = document.getElementById('ct-contact-form');
    if (!form) return;
    const name = document.getElementById('ct-name');
    const sender = document.getElementById('ct-email');
    const subject = document.getElementById('ct-subject');
    const message = document.getElementById('ct-message-text');
    const submit = document.getElementById('ct-submit');
    const count = document.getElementById('ct-count');
    const status = document.getElementById('ct-form-status');
    const hint = document.getElementById('ct-form-hint');
    const fallback = document.getElementById('ct-fallback');
    const fallbackText = document.getElementById('ct-copy-fallback');
    const recipient = document.getElementById('ct-recipient');

    function getSelectedEmail() {
        const key = recipient && recipient.value === 'institutionalEmail'
            ? 'institutionalEmail' : 'email';
        return getPublicUrl(key) ? String(DWANE_CONTACT[key]).trim() : '';
    }

    function refreshSubmitState() {
        if (getSelectedEmail()) {
            submit.innerHTML = 'Open email app <span aria-hidden="true">↗</span>';
            hint.textContent = 'This prepares your message in your email application. You must press Send there; the website does not send messages itself.';
        } else {
            submit.innerHTML = 'Copy your message <span aria-hidden="true">↗</span>';
            hint.textContent = 'No valid recipient email configured. This will copy your message instead of sending it.';
        }
    }
    if (recipient) recipient.addEventListener('change', refreshSubmitState);
    refreshSubmitState();

    message.addEventListener('input', function () {
        count.textContent = message.value.length + ' / 3000';
        status.textContent = '';
    });

    function prepareBody() {
        return 'Hello Dwane,\n\n' + message.value.trim() +
            '\n\nFrom: ' + name.value.trim() +
            '\nReply to: ' + sender.value.trim();
    }

    async function copyText(value) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(value);
            return true;
        }
        return false;
    }

    form.addEventListener('submit', async function (event) {
        event.preventDefault();
        status.classList.remove('is-error');
        fallback.hidden = true;

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        const title = subject.value + ' — message from ' + name.value.trim();
        const body = prepareBody();
        const emailAddress = getSelectedEmail();
        if (emailAddress) {
            window.location.href = 'mailto:' + emailAddress +
                '?subject=' + encodeURIComponent(title) +
                '&body=' + encodeURIComponent(body);
            status.textContent = 'Your email app should open. Please press Send there to deliver your message.';
            return;
        }
        const composed = 'Subject: ' + title + '\n\n' + body;
        try {
            if (await copyText(composed)) {
                status.textContent = 'Message copied! The website has not sent it. You can paste it into an email or chat.';
                return;
            }
        } catch (_) { /* Use manual-copy fallback below. */ }
        fallback.hidden = false;
        fallbackText.value = composed;
        fallbackText.focus();
        fallbackText.select();
        status.classList.add('is-error');
        status.textContent = 'Automatic copying is unavailable. Select and copy your prepared message below.';
    });
})();
