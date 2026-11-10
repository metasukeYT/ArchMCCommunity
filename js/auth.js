// ===== ArchMC Auth - Token-Based Verification System =====

const SECRET_SALT = 'ARCHMC_JPEN_TOKEN_SALT_2026';
const ROLE_ID = '1568130111243554868';

// In-memory fallback (works in any environment, file://, private mode)
let inMemoryAuthData = null;

// Storage Helpers (localStorage -> sessionStorage -> Cookie -> Memory)
function setCookie(name, value, days) {
    try {
        const expires = new Date(Date.now() + days * 864e5).toUTCString();
        document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/; SameSite=Lax';
    } catch (e) {}
}

function getCookie(name) {
    try {
        const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'));
        return match ? decodeURIComponent(match[1]) : null;
    } catch (e) {
        return null;
    }
}

function deleteCookie(name) {
    try {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';
    } catch (e) {}
}

function saveAuthData(data) {
    inMemoryAuthData = data;
    const jsonStr = JSON.stringify(data);
    try {
        localStorage.setItem('archmc_auth_link', jsonStr);
    } catch (e) {}
    try {
        sessionStorage.setItem('archmc_auth_link', jsonStr);
    } catch (e) {}
    setCookie('archmc_auth_link', jsonStr, 30);
}

function getAuthData() {
    if (inMemoryAuthData) return inMemoryAuthData;

    try {
        const local = localStorage.getItem('archmc_auth_link');
        if (local) return JSON.parse(local);
    } catch (e) {}

    try {
        const session = sessionStorage.getItem('archmc_auth_link');
        if (session) return JSON.parse(session);
    } catch (e) {}

    const cookie = getCookie('archmc_auth_link');
    if (cookie) {
        try {
            return JSON.parse(cookie);
        } catch (e) {}
    }
    return null;
}

function clearAuthData() {
    inMemoryAuthData = null;
    try {
        localStorage.removeItem('archmc_auth_link');
    } catch (e) {}
    try {
        sessionStorage.removeItem('archmc_auth_link');
    } catch (e) {}
    deleteCookie('archmc_auth_link');
}

// Pure JavaScript SHA-256 (works in file://, http://, any browser). Verified against Node crypto.
function sha256Pure(str) {
    const K = [
        0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
        0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
        0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
        0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
        0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
        0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
        0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
        0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2
    ];
    let H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
    const rotr = (x, n) => (x >>> n) | (x << (32 - n));

    // UTF-8 bytes
    const bytes = [];
    const utf8 = unescape(encodeURIComponent(str));
    for (let i = 0; i < utf8.length; i++) bytes.push(utf8.charCodeAt(i));
    const bitLen = bytes.length * 8;
    bytes.push(0x80);
    while (bytes.length % 64 !== 56) bytes.push(0);
    const hi = Math.floor(bitLen / 0x100000000);
    const lo = bitLen >>> 0;
    for (let i = 3; i >= 0; i--) bytes.push((hi >>> (i * 8)) & 255);
    for (let i = 3; i >= 0; i--) bytes.push((lo >>> (i * 8)) & 255);

    for (let off = 0; off < bytes.length; off += 64) {
        const w = new Array(64);
        for (let i = 0; i < 16; i++) {
            w[i] = (bytes[off + i*4] << 24) | (bytes[off + i*4 + 1] << 16) | (bytes[off + i*4 + 2] << 8) | bytes[off + i*4 + 3];
        }
        for (let i = 16; i < 64; i++) {
            const s0 = rotr(w[i-15], 7) ^ rotr(w[i-15], 18) ^ (w[i-15] >>> 3);
            const s1 = rotr(w[i-2], 17) ^ rotr(w[i-2], 19) ^ (w[i-2] >>> 10);
            w[i] = (w[i-16] + s0 + w[i-7] + s1) | 0;
        }
        let [a, b, c, d, e, f, g, h] = H;
        for (let i = 0; i < 64; i++) {
            const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
            const ch = (e & f) ^ (~e & g);
            const t1 = (h + S1 + ch + K[i] + w[i]) | 0;
            const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
            const maj = (a & b) ^ (a & c) ^ (b & c);
            const t2 = (S0 + maj) | 0;
            h = g; g = f; f = e; e = (d + t1) | 0;
            d = c; c = b; b = a; a = (t1 + t2) | 0;
        }
        H = [(H[0]+a)|0,(H[1]+b)|0,(H[2]+c)|0,(H[3]+d)|0,(H[4]+e)|0,(H[5]+f)|0,(H[6]+g)|0,(H[7]+h)|0];
    }
    return H.map(x => ('00000000' + (x >>> 0).toString(16)).slice(-8)).join('');
}

// Compute SHA-256 Hash 6 chars (Sync with Bot)
async function computeHash6(str) {
    try {
        if (window.crypto && window.crypto.subtle && typeof window.crypto.subtle.digest === 'function') {
            const encoder = new TextEncoder();
            const data = encoder.encode(str);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            return hex.substring(0, 6).toUpperCase();
        }
    } catch (e) {
        console.warn('crypto.subtle not available, using pure JS fallback:', e);
    }
    return sha256Pure(str).substring(0, 6).toUpperCase();
}

// Generate Link Token: LNK-<MCID>-<HASH6>
async function generateLinkToken(mcName) {
    const hash = await computeHash6(`LINK:${mcName}:${SECRET_SALT}`);
    return `LNK-${mcName}-${hash}`;
}

// Generate Unlink Token: UNL-<MCID>-<HASH6>
async function generateUnlinkToken(mcName) {
    const hash = await computeHash6(`UNLINK:${mcName}:${SECRET_SALT}`);
    return `UNL-${mcName}-${hash}`;
}

// Validation
function validateMcName(name) {
    return /^[a-zA-Z0-9_]{1,16}$/.test(name);
}

// Avatar Preview
let avatarDebounce = null;
function updateAvatarPreview(mcName) {
    clearTimeout(avatarDebounce);
    avatarDebounce = setTimeout(() => {
        const avatarImg = document.getElementById('avatarPreview');
        if (avatarImg && mcName && validateMcName(mcName)) {
            avatarImg.src = 'https://mc-heads.net/avatar/' + encodeURIComponent(mcName) + '/100';
        }
    }, 300);
}

// Copy to clipboard helper
async function copyTextToClipboard(text, btnElement, successMsg) {
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
        } else {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
        }
        if (btnElement) {
            const originalHTML = btnElement.innerHTML;
            btnElement.innerHTML = `<span>✓</span> <span>${successMsg || 'コピー完了!'}</span>`;
            btnElement.classList.add('copied');
            setTimeout(() => {
                btnElement.innerHTML = originalHTML;
                btnElement.classList.remove('copied');
            }, 2000);
        }
    } catch (err) {
        console.error('Failed to copy text:', err);
        prompt('以下の文字列をコピーしてください:', text);
    }
}

// UI State Management
// States: 'input' -> 'token-generated' -> 'linked'
async function renderState() {
    const authData = getAuthData();
    const inputCard = document.getElementById('stateInputBox');
    const tokenCard = document.getElementById('stateTokenBox');
    const linkedCard = document.getElementById('stateLinkedBox');

    if (!inputCard || !tokenCard || !linkedCard) return;

    if (!authData) {
        // State 1: Input form
        inputCard.classList.remove('hidden');
        tokenCard.classList.add('hidden');
        linkedCard.classList.add('hidden');
    } else if (authData.status === 'linked') {
        // State 3: Linked (Show Unlink Token)
        inputCard.classList.add('hidden');
        tokenCard.classList.add('hidden');
        linkedCard.classList.remove('hidden');

        const unlinkToken = await generateUnlinkToken(authData.mcName);

        document.getElementById('linkedMcid').textContent = authData.mcName;
        document.getElementById('linkedAvatar').src = `https://mc-heads.net/avatar/${encodeURIComponent(authData.mcName)}/100`;
        document.getElementById('unlinkTokenDisplay').textContent = unlinkToken;
        document.getElementById('unlinkCommandText').textContent = `/unlink token: ${unlinkToken}`;

        const copyUnlinkBtn = document.getElementById('copyUnlinkTokenBtn');
        if (copyUnlinkBtn) {
            copyUnlinkBtn.onclick = () => copyTextToClipboard(unlinkToken, copyUnlinkBtn, 'コピーしました');
        }
        const copyUnlinkCmdBtn = document.getElementById('copyUnlinkCmdBtn');
        if (copyUnlinkCmdBtn) {
            copyUnlinkCmdBtn.onclick = () => copyTextToClipboard(`/unlink token: ${unlinkToken}`, copyUnlinkCmdBtn, 'コマンドをコピーしました');
        }
    } else {
        // State 2: Link Token Generated, waiting for user to run /link in Discord
        inputCard.classList.add('hidden');
        tokenCard.classList.remove('hidden');
        linkedCard.classList.add('hidden');

        const linkToken = await generateLinkToken(authData.mcName);

        document.getElementById('tokenMcid').textContent = authData.mcName;
        document.getElementById('tokenAvatar').src = `https://mc-heads.net/avatar/${encodeURIComponent(authData.mcName)}/100`;
        document.getElementById('linkTokenDisplay').textContent = linkToken;
        document.getElementById('linkCommandText').textContent = `/link token: ${linkToken}`;

        const copyTokenBtn = document.getElementById('copyTokenBtn');
        if (copyTokenBtn) {
            copyTokenBtn.onclick = () => copyTextToClipboard(linkToken, copyTokenBtn, 'コピーしました');
        }
        const copyCmdBtn = document.getElementById('copyCmdBtn');
        if (copyCmdBtn) {
            copyCmdBtn.onclick = () => copyTextToClipboard(`/link token: ${linkToken}`, copyCmdBtn, 'コマンドをコピーしました');
        }
    }
}

// Handle Generate Token Form
async function handleGenerateToken(e) {
    if (e) e.preventDefault();

    const input = document.getElementById('mcidInput');
    const mcName = input ? input.value.trim() : '';

    if (!mcName) {
        if (input) {
            input.classList.add('error');
            input.focus();
        }
        alert('Minecraft ID (MCID) を入力してください。');
        return;
    }

    if (!validateMcName(mcName)) {
        if (input) {
            input.classList.add('error');
            input.focus();
        }
        alert('Minecraft IDは半角英数字とアンダースコア（_）のみで、1〜16文字以内で入力してください。\n入力値: ' + mcName);
        return;
    }

    const submitBtn = document.getElementById('submitGenerateBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>⏳</span> <span>トークン発行中...</span>';
    }

    try {
        const data = {
            mcName: mcName,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        saveAuthData(data);
        await renderState();
    } catch (err) {
        console.error('Error generating token:', err);
        alert('トークン発行中にエラーが発生しました:\n' + err.message);
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>⚡</span> <span>認証トークンを発行する</span>';
        }
    }
}

// Confirm Link in Discord was completed
async function handleConfirmLinked() {
    const authData = getAuthData();
    if (!authData) return;

    try {
        authData.status = 'linked';
        authData.linkedAt = new Date().toISOString();
        saveAuthData(authData);
        await renderState();
    } catch (e) {
        console.error(e);
    }
}

// Reset / Re-link another account
function handleResetLink() {
    const confirmMsg = '連携状態のリセットを行いますか？\n（※再度新しいMinecraft IDでトークンを発行できるようになります）';
    if (confirm(confirmMsg)) {
        clearAuthData();
        const mcidInput = document.getElementById('mcidInput');
        if (mcidInput) mcidInput.value = '';
        renderState();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderState();

    const form = document.getElementById('tokenGenerateForm');
    if (form) {
        form.addEventListener('submit', handleGenerateToken);
    }

    const mcidInput = document.getElementById('mcidInput');
    if (mcidInput) {
        mcidInput.addEventListener('input', () => {
            mcidInput.classList.remove('error');
            updateAvatarPreview(mcidInput.value.trim());
        });
    }

    const confirmBtn = document.getElementById('confirmLinkedBtn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', handleConfirmLinked);
    }

    const resetBtns = document.querySelectorAll('.reset-link-trigger');
    resetBtns.forEach(btn => {
        btn.addEventListener('click', handleResetLink);
    });
});
