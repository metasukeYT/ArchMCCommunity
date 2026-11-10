// ===== Auth Page Logic =====

const BOT_API_URL = window.BOT_API_URL || 'http://localhost:3000';
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1569495763116105758/--D7eY7jtum6MX_kMX4IkHI55OwD_fnqEXoULkGB2gwkkW0WONJMlplzFX96Dr3ncR8T';
const ROLE_ID = '1568130111243554868';

// ===== Cookie Helpers =====
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

// ===== Auth Data Management =====
function saveAuthData(mcName, discordId) {
    const data = {
        mcName: mcName,
        discordId: discordId,
        authDate: new Date().toISOString(),
        roleId: ROLE_ID
    };
    setCookie('archmc_auth', JSON.stringify(data), 365); // 1年保存
}

function getAuthData() {
    const raw = getCookie('archmc_auth');
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function clearAuthData() {
    deleteCookie('archmc_auth');
}

function isAuthenticated() {
    return getAuthData() !== null;
}

// ===== Validation =====
function validateMcName(name) {
    return /^[a-zA-Z0-9_]{1,16}$/.test(name);
}

function validateDiscordId(id) {
    // Discord username: 2-32 chars, lowercase letters, numbers, underscores, periods
    return /^[a-z0-9_.]{2,32}$/.test(id);
}

// ===== Avatar Preview =====
let avatarDebounce = null;
function updateAvatarPreview(mcName) {
    clearTimeout(avatarDebounce);
    avatarDebounce = setTimeout(() => {
        const avatarImg = document.getElementById('avatarPreview');
        if (avatarImg && mcName && validateMcName(mcName)) {
            avatarImg.src = 'https://mc-heads.net/avatar/' + encodeURIComponent(mcName) + '/100';
        }
    }, 500);
}

// ===== UI State Management =====
function showVerifiedState() {
    const authData = getAuthData();
    if (!authData) return;

    const formBox = document.getElementById('verifyFormBox');
    const statusBox = document.getElementById('verifiedStatusBox');

    if (formBox) formBox.classList.add('hidden');
    if (statusBox) {
        statusBox.classList.remove('hidden');

        // Populate data
        const mcidEl = document.getElementById('verifiedMcid');
        const discordEl = document.getElementById('verifiedDiscord');
        const dateEl = document.getElementById('verifiedDate');
        const avatarEl = document.getElementById('verifiedAvatar');

        if (mcidEl) mcidEl.textContent = authData.mcName;
        if (discordEl) discordEl.textContent = authData.discordId;
        if (dateEl) {
            const date = new Date(authData.authDate);
            const lang = (typeof currentLang !== 'undefined') ? currentLang : 'ja';
            dateEl.textContent = date.toLocaleString(lang === 'ja' ? 'ja-JP' : 'en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        }
        if (avatarEl) {
            avatarEl.src = 'https://mc-heads.net/avatar/' + encodeURIComponent(authData.mcName) + '/100';
        }
    }
}

function showFormState() {
    const formBox = document.getElementById('verifyFormBox');
    const statusBox = document.getElementById('verifiedStatusBox');

    if (formBox) formBox.classList.remove('hidden');
    if (statusBox) statusBox.classList.add('hidden');
}

// ===== Send Webhook =====
async function sendWebhook(type, mcName, discordId) {
    const now = new Date().toISOString();
    const lang = (typeof currentLang !== 'undefined') ? currentLang : 'ja';

    if (type === 'verify') {
        const embed = {
            title: lang === 'ja' ? '⚡ プレイヤー認証完了（自動連携）' : '⚡ Verification Completed (Auto-Linked)',
            color: 0x10B981,
            fields: [
                {
                    name: lang === 'ja' ? '🎮 ArchMC ゲーム内名前' : '🎮 ArchMC In-Game Name',
                    value: '`' + mcName + '`',
                    inline: true
                },
                {
                    name: lang === 'ja' ? '💬 Discord ユーザー名' : '💬 Discord Username',
                    value: '`' + discordId + '`',
                    inline: true
                },
                {
                    name: lang === 'ja' ? '🏷️ 付与ロール' : '🏷️ Assigned Role',
                    value: '<@&' + ROLE_ID + '>',
                    inline: false
                },
                {
                    name: lang === 'ja' ? '👤 連携対象' : '👤 Target User',
                    value: '@' + discordId,
                    inline: true
                }
            ],
            footer: { text: 'ArchMC JP/EN Community Auto-Auth' },
            timestamp: now
        };

        const payload = {
            username: 'ArchMC Auth Bot',
            avatar_url: '',
            content: lang === 'ja'
                ? `⚡ **【自動連携完了】** プレイヤー \`${mcName}\` と Discord \`@${discordId}\` の連携が完了しました！\nロール: <@&${ROLE_ID}>`
                : `⚡ **[Auto-Linked]** Player \`${mcName}\` has been linked with Discord \`@${discordId}\`!\nRole: <@&${ROLE_ID}>`,
            embeds: [embed]
        };

        return fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    }
}

// ===== Handle Verify Form Submit =====
async function handleVerifySubmit(e) {
    e.preventDefault();

    const mcName = document.getElementById('mcidInput').value.trim();
    const discordId = document.getElementById('discordInput').value.trim();
    const submitBtn = document.getElementById('submitVerifyBtn');

    // Validate
    let hasError = false;
    if (!mcName || !validateMcName(mcName)) {
        document.getElementById('mcidInput').classList.add('error');
        hasError = true;
    }
    if (!discordId || !validateDiscordId(discordId)) {
        document.getElementById('discordInput').classList.add('error');
        hasError = true;
    }
    if (hasError) return;

    // Loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span><span>認証＆ロール付与中...</span>';

    try {
        let roleGranted = false;

        // Try calling Discord Bot API first (for instant role grant)
        try {
            const apiRes = await fetch(`${BOT_API_URL}/api/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mcName, discordUsername: discordId })
            });

            if (apiRes.ok) {
                const result = await apiRes.json();
                if (result.success) {
                    roleGranted = true;
                }
            } else {
                const errorData = await apiRes.json().catch(() => ({}));
                if (errorData.error) {
                    alert(errorData.error);
                    return;
                }
            }
        } catch (botErr) {
            // Bot API offline or not reachable from client: fallback to Webhook
            console.log('Bot API unreachable, fallback to webhook:', botErr.message);
        }

        // Send Webhook notification (if not already handled by bot)
        if (!roleGranted) {
            await sendWebhook('verify', mcName, discordId);
        }

        // Save to cookie (1 year)
        saveAuthData(mcName, discordId);
        // Show verified state immediately
        showVerifiedState();

    } catch (error) {
        console.error('Auth error:', error);
        const lang = (typeof currentLang !== 'undefined') ? currentLang : 'ja';
        alert(lang === 'ja' ? '通信エラーが発生しました。時間をおいて再度お試しください。' : 'A connection error occurred. Please try again later.');
    } finally {
        submitBtn.disabled = false;
        const lang = (typeof currentLang !== 'undefined') ? currentLang : 'ja';
        submitBtn.innerHTML = '<span>⚡</span><span>' + (lang === 'ja' ? '認証してロールを受け取る' : 'Verify & Get Role') + '</span>';
    }
}

// ===== Discord ID Help Modal =====
function initHelpModal() {
    const helpBtn = document.getElementById('discordHelpBtn');
    const modal = document.getElementById('helpModal');
    if (!helpBtn || !modal) return;

    helpBtn.addEventListener('click', () => {
        modal.classList.add('open');
    });

    // Close triggers
    modal.querySelectorAll('.modal-close-trigger').forEach(el => {
        el.addEventListener('click', () => {
            modal.classList.remove('open');
        });
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('open');
        }
    });
}

// ===== Spinner CSS injection =====
function injectSpinnerCSS() {
    if (document.getElementById('spinner-style')) return;
    const style = document.createElement('style');
    style.id = 'spinner-style';
    style.textContent = '.spinner{display:inline-block;width:18px;height:18px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:auth-spin .6s linear infinite}@keyframes auth-spin{to{transform:rotate(360deg)}}.hidden{display:none!important}';
    document.head.appendChild(style);
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    injectSpinnerCSS();
    initHelpModal();

    // Check if already authenticated
    if (isAuthenticated()) {
        showVerifiedState();
    }

    // Verify form submit
    const verifyForm = document.getElementById('verifyForm');
    if (verifyForm) {
        verifyForm.addEventListener('submit', handleVerifySubmit);
    }

    // MCID input: avatar preview + clear error
    const mcidInput = document.getElementById('mcidInput');
    if (mcidInput) {
        mcidInput.addEventListener('input', () => {
            mcidInput.classList.remove('error');
            updateAvatarPreview(mcidInput.value.trim());
        });
    }

    // Discord username input: allow lowercase letters, numbers, underscores, periods
    const discordInput = document.getElementById('discordInput');
    if (discordInput) {
        discordInput.addEventListener('input', () => {
            discordInput.value = discordInput.value.toLowerCase().replace(/[^a-z0-9_.]/g, '');
            discordInput.classList.remove('error');
        });
    }
});
