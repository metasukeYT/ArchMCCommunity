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

// Pure JavaScript SHA-256 (Guaranteed to work in file://, non-HTTPS, any browser)
function sha256Pure(ascii) {
    function rightRotate(value, amount) {
        return (value >>> amount) | (value << (32 - amount));
    }
    const mathPow = Math.pow;
    const maxWord = mathPow(2, 32);
    const lengthProperty = 'length';
    let i, j;
    let result = '';

    const words = [];
    const asciiBitLength = ascii[lengthProperty] * 8;
    
    let hash = [];
    const k = [];
    let primeCounter = 0;

    const isComposite = {};
    for (let candidate = 2; primeCounter < 64; candidate++) {
        if (!isComposite[candidate]) {
            for (i = 0; i < 300; i += candidate) {
                isComposite[i] = candidate;
            }
            hash[primeCounter] = (mathPow(candidate, .5) * maxWord) | 0;
            k[primeCounter++] = (mathPow(candidate, 1/3) * maxWord) | 0;
        }
    }
    
    ascii += '\x80';
    while (ascii[lengthProperty] % 64 - 56) ascii += '\x00';
    for (i = 0; i < ascii[lengthProperty]; i++) {
        j = ascii.charCodeAt(i);
        if (j >> 8) return ''; // ASCII only
        words[i >> 2] |= j << ((3 - i) % 4) * 8;
    }
    words[words[lengthProperty]] = ((asciiBitLength / maxWord) | 0);
    words[words[lengthProperty]] = (asciiBitLength | 0);
    
    for (j = 0; j < words[lengthProperty];) {
        const w = words.slice(j, j += 16);
        const oldHash = hash;
        hash = hash.slice(0, 8);
        
        for (i = 0; i < 64; i++) {
            const w15 = w[i - 15], w2 = w[i - 2];
            const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
            const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
            const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
            const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
            const temp1 = hash[7] + (rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25)) + ch + k[i] + (w[i] = (i < 16) ? w[i] : (w[i - 16] + s0 + w[i - 7] + s1) | 0);
            const temp2 = (rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22)) + maj;
            
            hash = [(temp1 + temp2) | 0].concat(hash);
            hash[4] = (hash[4] + temp1) | 0;
        }
        for (i = 0; i < 8; i++) {
            hash[i] = (hash[i] + oldHash[i]) | 0;
        }
    }
    for (i = 0; i < 8; i++) {
        for (j = 3; j + 1; j--) {
            const b = (hash[i] >> (j * 8)) & 255;
            result += ((b < 16) ? '0' : '') + b.toString(16);
        }
    }
    return result;
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
