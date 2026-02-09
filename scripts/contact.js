/**
 * Contact Form Handler
 * Thinkers GK - Contact Page
 *
 * Handles form validation, submission via EmailJS,
 * and fallback to mailto.
 */

(function() {
    'use strict';

    // EmailJS Configuration
    // Replace these with your actual EmailJS credentials
    const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';
    const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
    const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';

    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const formStatus = document.getElementById('formStatus');

    if (!form) return;

    // Real-time validation on blur
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(function(field) {
        field.addEventListener('blur', function() {
            validateField(this);
        });
        field.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                validateField(this);
            }
        });
    });

    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Validate all fields
        var isValid = true;
        requiredFields.forEach(function(field) {
            if (!validateField(field)) {
                isValid = false;
            }
        });

        if (!isValid) {
            shakeForm();
            return;
        }

        // Set loading state
        setLoading(true);

        // Collect form data
        var formData = {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            email: document.getElementById('email').value.trim(),
            company: document.getElementById('company').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            service: document.getElementById('service').value,
            message: document.getElementById('message').value.trim(),
            newsletter: document.getElementById('newsletter').checked
        };

        // Try EmailJS first, fall back to mailto
        if (EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY' && typeof emailjs !== 'undefined') {
            sendViaEmailJS(formData);
        } else {
            sendViaMailto(formData);
        }
    });

    /**
     * Validate a single form field
     */
    function validateField(field) {
        var value = field.value.trim();
        var isValid = true;

        if (field.required && !value) {
            isValid = false;
        }

        if (field.type === 'email' && value) {
            var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
            }
        }

        if (field.tagName === 'SELECT' && field.required && !value) {
            isValid = false;
        }

        if (isValid) {
            field.classList.remove('error');
        } else {
            field.classList.add('error');
        }

        return isValid;
    }

    /**
     * Send form data via EmailJS
     */
    function sendViaEmailJS(data) {
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
            from_name: data.firstName + ' ' + data.lastName,
            from_email: data.email,
            company: data.company,
            phone: data.phone,
            service: data.service,
            message: data.message,
            newsletter: data.newsletter ? 'Yes' : 'No'
        }).then(function() {
            showStatus('success', 'Message sent successfully! We\'ll get back to you within 24 hours.');
            form.reset();
            trackEvent('contact_form_submitted', 'emailjs');
        }).catch(function() {
            // Fall back to mailto on EmailJS failure
            sendViaMailto(data);
        }).finally(function() {
            setLoading(false);
        });
    }

    /**
     * Fallback: open mailto link
     */
    function sendViaMailto(data) {
        var subject = encodeURIComponent('Inquiry: ' + data.service);
        var body = encodeURIComponent(
            'Name: ' + data.firstName + ' ' + data.lastName + '\n' +
            'Email: ' + data.email + '\n' +
            'Company: ' + data.company + '\n' +
            'Phone: ' + data.phone + '\n' +
            'Service: ' + data.service + '\n\n' +
            'Message:\n' + data.message
        );
        window.location.href = 'mailto:info@thinkersgk.com?subject=' + subject + '&body=' + body;
        showStatus('success', 'Opening your email client. If it doesn\'t open, email us at info@thinkersgk.com');
        setLoading(false);
        trackEvent('contact_form_submitted', 'mailto');
    }

    /**
     * Toggle loading state on submit button
     */
    function setLoading(loading) {
        var btnText = submitBtn.querySelector('.btn-text');
        var btnLoading = submitBtn.querySelector('.btn-loading');
        if (loading) {
            submitBtn.disabled = true;
            if (btnText) btnText.style.display = 'none';
            if (btnLoading) btnLoading.style.display = 'inline-flex';
        } else {
            submitBtn.disabled = false;
            if (btnText) btnText.style.display = 'inline';
            if (btnLoading) btnLoading.style.display = 'none';
        }
    }

    /**
     * Show form status message
     */
    function showStatus(type, message) {
        if (!formStatus) return;
        formStatus.className = 'form-status ' + type;
        formStatus.textContent = message;
        formStatus.style.display = 'block';

        // Auto-hide after 5 seconds
        setTimeout(function() {
            formStatus.style.display = 'none';
        }, 5000);
    }

    /**
     * Shake animation on validation failure
     */
    function shakeForm() {
        form.classList.add('shake');
        setTimeout(function() {
            form.classList.remove('shake');
        }, 600);
    }

    /**
     * Track events (Google Analytics if available)
     */
    function trackEvent(action, method) {
        if (typeof gtag === 'function') {
            gtag('event', action, {
                event_category: 'contact',
                event_label: method
            });
        }
    }
})();
