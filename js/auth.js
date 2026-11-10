// ===== ArchMC Auth - Token-Based Verification System =====

const SECRET_SALT = 'ARCHMC_JPEN_TOKEN_SALT_2026';
const ROLE_ID = '1568130111243554868';

// Cookie Helpers
function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/; SameSite=Lax';
}

function getCookie(name) {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
}

function deleteCookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';
}

// Compute SHA-256 Hash 6 chars (Sync with Bot)
async function computeHash6(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hex.substring(0, 6).toUpperCase();
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
    }, 400);
}

// Copy to clipboard helper
async function copyTextToClipboard(text, btnElement, successMsg) {
    try {
        await navigator.clipboard.writeText(text);
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
    }
}

// UI State Management
// States: 'input' -> 'token-generated' -> 'linked'
async function renderState() {
    const authDataRaw = getCookie('archmc_auth_link');
    const inputCard = document.getElementById('stateInputBox');
    const tokenCard = document.getElementById('stateTokenBox');
    const linkedCard = document.getElementById('stateLinkedBox');

    if (!inputCard || !tokenCard || !linkedCard) return;

    if (!authDataRaw) {
        // State 1: Input form
        inputCard.classList.remove('hidden');
        tokenCard.classList.add('hidden');
        linkedCard.classList.add('hidden');
    } else {
        try {
            const authData = JSON.parse(authDataRaw);

            if (authData.status === 'linked') {
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
        } catch (e) {
            deleteCookie('archmc_auth_link');
            inputCard.classList.remove('hidden');
            tokenCard.classList.add('hidden');
            linkedCard.classList.add('hidden');
        }
    }
}

// Handle Generate Token Form
async function handleGenerateToken(e) {
    e.preventDefault();

    const mcName = document.getElementById('mcidInput').value.trim();
    if (!mcName || !validateMcName(mcName)) {
        document.getElementById('mcidInput').classList.add('error');
        return;
    }

    // Save pending state in cookie
    const data = {
        mcName: mcName,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    setCookie('archmc_auth_link', JSON.stringify(data), 30); // 30 days

    await renderState();
}

// Confirm Link in Discord was completed
async function handleConfirmLinked() {
    const authDataRaw = getCookie('archmc_auth_link');
    if (!authDataRaw) return;

    try {
        const authData = JSON.parse(authDataRaw);
        authData.status = 'linked';
        authData.linkedAt = new Date().toISOString();
        setCookie('archmc_auth_link', JSON.stringify(authData), 365); // 1 year
        await renderState();
    } catch (e) {
        console.error(e);
    }
}

// Reset / Re-link another account
function handleResetLink() {
    const confirmMsg = '連携状態のリセットを行いますか？\n（※Discord側のロール削除はDiscord上で /unlink を実行してください）';
    if (confirm(confirmMsg)) {
        deleteCookie('archmc_auth_link');
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
