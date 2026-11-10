/**
 * ArchMC Discord Auth & Moderation Bot (Token-Based System + Giveaway)
 * 
 * Commands:
 *  - /link <token>          : Verify using token generated from Website & auto-grant role
 *  - /unlink [token]        : Unlink using unlink token & auto-remove role
 *  - /unlinkadmin <name>    : [Admin] Force unlink a player & auto-remove role
 *  - /wholink <name>        : [Admin] Lookup player info by Discord or MCID
 *  - /linkinfo              : Check own link info
 *  - /linklist              : [Admin] List all linked players
 *  - /giveaway              : Create an interactive giveaway with modal & timer
 */

require('dotenv').config();
const { 
  Client, 
  GatewayIntentBits, 
  REST, 
  Routes, 
  SlashCommandBuilder, 
  PermissionFlagsBits, 
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  RoleSelectMenuBuilder
} = require('discord.js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const cors = require('cors');

// Process Error Handlers (Prevents Bot Crashes)
process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ Unhandled Rejection:', reason);
});
process.on('uncaughtException', err => {
  console.error('⚠️ Uncaught Exception:', err);
});

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID || '1569551679840591892';
const ROLE_ID = process.env.ROLE_ID || '1568130111243554868';
const WEBHOOK_URL = process.env.WEBHOOK_URL;
const PORT = process.env.PORT || 10000;

// HTTP Health Check Server (Required for Render Web Service)
const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('ArchMC Discord Auth & Giveaway Bot is online and running!');
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    botOnline: client.isReady(),
    uptime: process.uptime()
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 HTTP Server listening on port ${PORT} (Render Health Check OK)`);
});

const SECRET_SALT = 'ARCHMC_JPEN_TOKEN_SALT_2026';

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'links.json');
const GIVEAWAYS_FILE = path.join(DATA_DIR, 'giveaways.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf8');
if (!fs.existsSync(GIVEAWAYS_FILE)) fs.writeFileSync(GIVEAWAYS_FILE, JSON.stringify([], null, 2), 'utf8');

// ==========================================
// Data Helpers (Links)
// ==========================================
function getLinks() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (err) {
    console.error('Error reading links file:', err);
    return [];
  }
}

function saveLinks(links) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(links, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving links file:', err);
  }
}

function addLink(discordId, discordUsername, mcName) {
  const links = getLinks();
  const filtered = links.filter(l => l.discordId !== discordId && l.mcName.toLowerCase() !== mcName.toLowerCase());
  filtered.push({
    discordId,
    discordUsername,
    mcName,
    linkedAt: new Date().toISOString()
  });
  saveLinks(filtered);
}

function removeLinkByDiscordId(discordId) {
  const links = getLinks();
  const target = links.find(l => l.discordId === discordId);
  if (target) {
    saveLinks(links.filter(l => l.discordId !== discordId));
    return target;
  }
  return null;
}

function removeLinkByMcName(mcName) {
  const links = getLinks();
  const search = mcName.toLowerCase().trim();
  const target = links.find(l => l.mcName.toLowerCase() === search);
  if (target) {
    saveLinks(links.filter(l => l !== target));
    return target;
  }
  return null;
}

// Normalize pasted tokens (full-width chars, odd dashes, spaces, quotes, zero-width chars)
function normalizeToken(raw) {
  if (!raw || typeof raw !== 'string') return '';
  return raw
    .normalize('NFKC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[\u2010-\u2015\u2212\u30FC\uFF0D]/g, '-')
    .replace(/[`"'\u201C\u201D\u2018\u2019\s]/g, '')
    .replace(/^token:/i, '');
}

// Token Verification Functions
function verifyLinkToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = normalizeToken(token).split('-');
  if (parts.length !== 3 || parts[0].toUpperCase() !== 'LNK') return null;

  const mcName = parts[1];
  const hash = parts[2].toUpperCase();

  if (!/^[a-zA-Z0-9_]{1,16}$/.test(mcName)) return null;

  const expectedHash = crypto
    .createHash('sha256')
    .update(`LINK:${mcName}:${SECRET_SALT}`)
    .digest('hex')
    .substring(0, 6)
    .toUpperCase();

  return hash === expectedHash ? mcName : null;
}

function verifyUnlinkToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = normalizeToken(token).split('-');
  if (parts.length !== 3 || parts[0].toUpperCase() !== 'UNL') return null;

  const mcName = parts[1];
  const hash = parts[2].toUpperCase();

  if (!/^[a-zA-Z0-9_]{1,16}$/.test(mcName)) return null;

  const expectedHash = crypto
    .createHash('sha256')
    .update(`UNLINK:${mcName}:${SECRET_SALT}`)
    .digest('hex')
    .substring(0, 6)
    .toUpperCase();

  return hash === expectedHash ? mcName : null;
}

// ==========================================
// Giveaway Data Helpers & Logic
// ==========================================
function getGiveaways() {
  try {
    return JSON.parse(fs.readFileSync(GIVEAWAYS_FILE, 'utf8'));
  } catch (err) {
    console.error('Error reading giveaways file:', err);
    return [];
  }
}

function saveGiveaways(giveaways) {
  try {
    fs.writeFileSync(GIVEAWAYS_FILE, JSON.stringify(giveaways, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving giveaways file:', err);
  }
}

// Duration parser: e.g. "10 minutes", "10m", "1h", "2 days", "30s"
function parseDuration(input) {
  if (!input) return null;
  const str = input.toLowerCase().trim();
  const regex = /^(\d+)\s*(s|sec|secs|second|seconds|m|min|mins|minute|minutes|h|hr|hrs|hour|hours|d|day|days|w|week|weeks)?$/;
  const match = str.match(regex);
  if (!match) return null;

  const value = parseInt(match[1], 10);
  const unit = match[2] || 'm';

  if (unit.startsWith('s')) return value * 1000;
  if (unit.startsWith('m')) return value * 60 * 1000;
  if (unit.startsWith('h')) return value * 60 * 60 * 1000;
  if (unit.startsWith('d')) return value * 24 * 60 * 60 * 1000;
  if (unit.startsWith('w')) return value * 7 * 24 * 60 * 60 * 1000;
  return null;
}

// Helper to build the Giveaway Modal (5 fields, Image 1 layout with GUI Multi-Role Select)
function buildGiveawayModal() {
  const modal = new ModalBuilder()
    .setCustomId('giveaway_modal')
    .setTitle('Create a Giveaway');

  // Input 1: Duration *
  const durationInput = new TextInputBuilder()
    .setCustomId('duration')
    .setLabel('Duration *')
    .setPlaceholder('Ex: 10 minutes')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  // Input 2: Number of Winners *
  const winnersInput = new TextInputBuilder()
    .setCustomId('winners')
    .setLabel('Number of Winners *')
    .setValue('1')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  // Input 3: Prize *
  const prizeInput = new TextInputBuilder()
    .setCustomId('prize')
    .setLabel('Prize *')
    .setPlaceholder('Ex: ArchMC Money 150k')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  // Input 4: Description
  const descInput = new TextInputBuilder()
    .setCustomId('description')
    .setLabel('Description')
    .setPlaceholder('Ex: Survival Money 150k Giveaway!')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(false);

  // Input 5: GUI Multi-Role Select Menu (Type 18 Label wrapper in Discord Modal)
  const roleComponent = {
    type: 18,
    label: 'Required Role (複数選択可能)',
    description: '参加条件にするロールを選択（空欄で誰でも参加可能）',
    component: {
      type: 6,
      custom_id: 'required_roles',
      placeholder: 'サーバー内のロールを選択（複数選択可能）...',
      min_values: 0,
      max_values: 15,
      required: false
    },
    toJSON() {
      return {
        type: 18,
        label: this.label,
        description: this.description,
        component: this.component
      };
    }
  };

  modal.addComponents(
    new ActionRowBuilder().addComponents(durationInput),
    new ActionRowBuilder().addComponents(winnersInput),
    new ActionRowBuilder().addComponents(prizeInput),
    new ActionRowBuilder().addComponents(descInput),
    roleComponent
  );

  return modal;
}

// Fallback modal with standard text inputs (if Discord client/API rejects custom components in modal)
function buildFallbackGiveawayModal() {
  const modal = new ModalBuilder()
    .setCustomId('giveaway_modal')
    .setTitle('Create a Giveaway');

  const durationInput = new TextInputBuilder()
    .setCustomId('duration')
    .setLabel('Duration *')
    .setPlaceholder('Ex: 10 minutes')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const winnersInput = new TextInputBuilder()
    .setCustomId('winners')
    .setLabel('Number of Winners *')
    .setValue('1')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const prizeInput = new TextInputBuilder()
    .setCustomId('prize')
    .setLabel('Prize *')
    .setPlaceholder('Ex: ArchMC Money 150k')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const descInput = new TextInputBuilder()
    .setCustomId('description')
    .setLabel('Description')
    .setPlaceholder('Ex: Survival Money 150k Giveaway!')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(false);

  const roleInput = new TextInputBuilder()
    .setCustomId('required_roles_text')
    .setLabel('Required Role(s)')
    .setPlaceholder('ロール名またはID（複数指定時はカンマ区切り、空欄で指定なし）')
    .setStyle(TextInputStyle.Short)
    .setRequired(false);

  modal.addComponents(
    new ActionRowBuilder().addComponents(durationInput),
    new ActionRowBuilder().addComponents(winnersInput),
    new ActionRowBuilder().addComponents(prizeInput),
    new ActionRowBuilder().addComponents(descInput),
    new ActionRowBuilder().addComponents(roleInput)
  );

  return modal;
}

// Build Giveaway Embed (Running or Ended)
function createGiveawayEmbed(giveaway, isEnded = false, winners = []) {
  const endSec = Math.floor(giveaway.endTime / 1000);
  const embed = new EmbedBuilder().setColor(isEnded ? 0x2B2D31 : 0x5865F2);

  // Title: Prize
  embed.setTitle(giveaway.prize);

  let desc = '';
  if (giveaway.description) {
    desc += `${giveaway.description}\n\n`;
  }

  if (isEnded) {
    // Exact format matching the user's second screenshot
    desc += `Ended: <t:${endSec}:R> (<t:${endSec}:f>)\n`;
    desc += `Hosted by: <@${giveaway.hostId}>\n`;
    desc += `Entries: **${giveaway.entries.length}**\n`;
    if (winners.length > 0) {
      desc += `Winners: ${winners.map(id => `<@${id}>`).join(', ')}`;
    } else {
      desc += `Winners: なし (参加者不足)`;
    }
  } else {
    // Running format
    desc += `Ends: <t:${endSec}:R> (<t:${endSec}:f>)\n`;
    desc += `Hosted by: <@${giveaway.hostId}>\n`;
    const requiredRoles = giveaway.requiredRoleIds || (giveaway.requiredRoleId ? [giveaway.requiredRoleId] : []);
    if (requiredRoles.length > 0) {
      const roleText = requiredRoles.map(id => `<@&${id}>`).join(' ');
      desc += `Required Role${requiredRoles.length > 1 ? 's' : ''}: ${roleText}\n`;
    }
    desc += `Entries: **${giveaway.entries.length}**\n`;
    desc += `Winners: **${giveaway.winnersCount}**`;
  }

  embed.setDescription(desc);
  embed.setTimestamp(new Date(giveaway.endTime));
  return embed;
}

// End a Giveaway & pick winners
async function endGiveaway(giveawayId) {
  const giveaways = getGiveaways();
  const giveaway = giveaways.find(g => g.id === giveawayId && !g.ended);
  if (!giveaway) return;

  giveaway.ended = true;

  try {
    const channel = await client.channels.fetch(giveaway.channelId).catch(() => null);
    if (!channel) {
      saveGiveaways(giveaways);
      return;
    }

    const message = await channel.messages.fetch(giveaway.messageId).catch(() => null);

    // Pick random winners
    const entries = [...giveaway.entries];
    const winners = [];
    const count = Math.min(giveaway.winnersCount, entries.length);

    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * entries.length);
      winners.push(entries.splice(randomIndex, 1)[0]);
    }

    giveaway.winners = winners;
    saveGiveaways(giveaways);

    // Update Message to Ended State (No buttons, match screenshot 2)
    const endedEmbed = createGiveawayEmbed(giveaway, true, winners);
    if (message) {
      await message.edit({
        embeds: [endedEmbed],
        components: []
      });
    }

    // Send Winner Announcement
    if (winners.length > 0) {
      const winnersMention = winners.map(id => `<@${id}>`).join(' ');
      await channel.send({
        content: `🎉 おめでとうございます！ ${winnersMention} が **${giveaway.prize}** に当選しました！`
      });
    } else {
      await channel.send({
        content: `⚠️ **${giveaway.prize}** のギブアウェイが終了しましたが、参加者がいなかったため当選者はいませんでした。`
      });
    }
  } catch (err) {
    console.error(`Error ending giveaway ${giveawayId}:`, err);
  }
}

// Schedule existing running giveaways on startup
function scheduleGiveaways() {
  const giveaways = getGiveaways();
  const now = Date.now();

  giveaways.forEach(g => {
    if (!g.ended) {
      const remaining = g.endTime - now;
      if (remaining <= 0) {
        endGiveaway(g.id);
      } else {
        setTimeout(() => endGiveaway(g.id), remaining);
      }
    }
  });
}

// ==========================================
// Discord Client Setup
// ==========================================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages
  ]
});

// Slash Commands Definition
const commands = [
  new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('ギブアウェイ（抽選会）の作成画面を開きます。')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  new SlashCommandBuilder()
    .setName('link')
    .setDescription('Webサイトで発行したトークンを使ってMinecraftアカウントを連携します。')
    .addStringOption(option =>
      option.setName('token')
        .setDescription('Webサイトで発行された認証トークン（例: LNK-Steve-XXXXXX）')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('unlink')
    .setDescription('Minecraftアカウントとの連携を解除し、ロールを削除します。')
    .addStringOption(option =>
      option.setName('token')
        .setDescription('Webサイトで発行された解除トークン（例: UNL-Steve-XXXXXX）')
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName('unlinkadmin')
    .setDescription('【運営専用】指定プレイヤーの連携を強制解除しロールを自動剥奪します。')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('解除対象のMinecraft ID、またはDiscordユーザー名')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  new SlashCommandBuilder()
    .setName('wholink')
    .setDescription('【運営専用】DiscordユーザーまたはMCIDの連携情報を照会します。')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('照会したいDiscord名、メンション、ID、またはMinecraft ID')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  new SlashCommandBuilder()
    .setName('linkinfo')
    .setDescription('現在のMinecraft連携情報を確認します。'),

  new SlashCommandBuilder()
    .setName('linklist')
    .setDescription('【運営専用】現在連携されているプレイヤー一覧を確認します。')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
].map(command => command.toJSON());

async function registerSlashCommands() {
  const rest = new REST({ version: '10' }).setToken(TOKEN);
  try {
    console.log('Registering slash commands (/giveaway, /link, /unlink, /unlinkadmin, /wholink, /linkinfo, /linklist)...');
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );
    console.log('✅ Successfully registered all slash commands!');
  } catch (error) {
    console.error('Error registering slash commands:', error);
  }
}

client.on('error', err => {
  console.error('⚠️ Discord Client Error:', err);
});

client.once('ready', async () => {
  console.log(`=========================================`);
  console.log(` ArchMC Auth & Giveaway Bot Online: ${client.user.tag}`);
  console.log(` Target Role ID: ${ROLE_ID}`);
  console.log(`=========================================`);
  registerSlashCommands().catch(err => console.error('Register commands error:', err));
  scheduleGiveaways();
});

// ==========================================
// Interaction Handler (Commands, Modals, Buttons)
// ==========================================
client.on('interactionCreate', async interaction => {
  try {
    // 1. Slash Commands
    if (interaction.isChatInputCommand()) {
      const { commandName } = interaction;

      // --- /giveaway (Directly opens Modal with GUI Multi-Role Select) ---
      if (commandName === 'giveaway') {
        try {
          const modal = buildGiveawayModal();
          await interaction.showModal(modal);
        } catch (err) {
          if (err.code === 10062) {
            console.warn('⚠️ /giveaway interaction timed out (10062).');
            return;
          }
          console.warn('Could not show multi-role component modal, attempting fallback modal:', err.message);
          try {
            const fallbackModal = buildFallbackGiveawayModal();
            await interaction.showModal(fallbackModal);
          } catch (e2) {
            console.error('Fallback modal error:', e2);
          }
        }
        return;
      }

    // --- /link <token> ---
    else if (commandName === 'link') {
      await interaction.deferReply({ ephemeral: true });

      const rawToken = interaction.options.getString('token').trim();
      const mcName = verifyLinkToken(rawToken);
      console.log(`[/link] user=${interaction.user.tag} verified=${mcName ? 'OK' : 'NG'}`);

      if (!interaction.inGuild() || !interaction.member) {
        return interaction.editReply({ content: '❌ このコマンドはサーバー内で実行してください。' });
      }

      if (!mcName) {
        return interaction.editReply({
          content: '❌ **無効なトークンです。**\nWebサイトに表示された `LNK-` から始まるトークン全体（MCIDとハッシュ6桁を含む）を、そのままコピーして貼り付けてください。（例: `LNK-Steve-A1B2C3`）'
        });
      }

      const member = interaction.member;

      try {
        if (!member.roles.cache.has(ROLE_ID)) {
          await member.roles.add(ROLE_ID, `Verified with token for MCID: ${mcName}`);
        }

        addLink(interaction.user.id, interaction.user.username, mcName);

        const embed = new EmbedBuilder()
          .setTitle('⚡ 認証＆ロール付与が完了しました！')
          .setColor(0x10B981)
          .addFields(
            { name: '🎮 Minecraft ID', value: `\`${mcName}\``, inline: true },
            { name: '💬 Discord', value: `<@${interaction.user.id}> (\`${interaction.user.username}\`)`, inline: true },
            { name: '🏷️ 付与ロール', value: `<@&${ROLE_ID}>`, inline: false }
          )
          .setThumbnail(`https://mc-heads.net/avatar/${encodeURIComponent(mcName)}/100`)
          .setFooter({ text: 'Webサイトに戻るとUnlink用トークンが表示されます' })
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });

        if (WEBHOOK_URL) {
          fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content: `⚡ **【トークン認証完了】** <@${interaction.user.id}> が \`${mcName}\` で連携しました。ロール <@&${ROLE_ID}> を付与しました。`
            })
          }).catch(() => {});
        }
      } catch (err) {
        console.error('Error in /link:', err);
        await interaction.editReply({
          content: `⚠️ ロール付与中にエラーが発生しました。\nBotのロール順位（付与するロールより上にあること）と「ロールの管理」権限をご確認ください。\nエラー: ${err.message}`
        });
      }
    }

    // --- /unlink [token] ---
    else if (commandName === 'unlink') {
      await interaction.deferReply({ ephemeral: true });

      const tokenInput = interaction.options.getString('token');
      const member = interaction.member;

      let targetMcName = null;
      if (tokenInput) {
        targetMcName = verifyUnlinkToken(tokenInput.trim());
        if (!targetMcName) {
          return interaction.editReply({
            content: '❌ **無効な解除トークンです。**\nWebサイトに表示されている解除トークン（例: `UNL-Steve-XXXXXX`）を正しく入力してください。'
          });
        }
      }

      let removed = removeLinkByDiscordId(interaction.user.id);
      if (!removed && targetMcName) {
        removed = removeLinkByMcName(targetMcName);
      }

      try {
        let roleRemoved = false;
        if (member.roles.cache.has(ROLE_ID)) {
          await member.roles.remove(ROLE_ID, 'Unlinked via /unlink');
          roleRemoved = true;
        }

        const mcInfo = removed ? ` (Minecraft ID: \`${removed.mcName}\`)` : (targetMcName ? ` (Minecraft ID: \`${targetMcName}\`)` : '');

        await interaction.editReply({
          content: `✅ 連携を解除しました${mcInfo}。\n${roleRemoved ? '付与されていたロールを自動で削除しました。' : 'ロールは既に解除されていました。'}`
        });

        if (WEBHOOK_URL) {
          fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content: `🔓 **[/unlink]** <@${interaction.user.id}> が連携を解除しました${mcInfo}。ロールを剥奪しました。`
            })
          }).catch(() => {});
        }
      } catch (err) {
        console.error('Error in /unlink:', err);
        await interaction.editReply({
          content: `⚠️ ロール解除中にエラーが発生しました: ${err.message}`
        });
      }
    }

    // --- /unlinkadmin <name> ---
    else if (commandName === 'unlinkadmin') {
      await interaction.deferReply({ ephemeral: false });

      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles) && 
          !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.editReply({ content: '❌ このコマンドは運営・管理者専用です。' });
      }

      const queryName = interaction.options.getString('name').trim();
      const search = queryName.toLowerCase().replace(/^@/, '');

      const links = getLinks();
      const targetLink = links.find(l => 
        l.mcName.toLowerCase() === search ||
        l.discordUsername.toLowerCase() === search ||
        l.discordId === search
      );

      let targetDiscordId = targetLink ? targetLink.discordId : null;
      let targetMember = null;

      const allMembers = await interaction.guild.members.fetch().catch(() => null);

      if (targetDiscordId && allMembers) {
        targetMember = allMembers.get(targetDiscordId);
      } else if (allMembers) {
        targetMember = allMembers.find(m => 
          m.user.username.toLowerCase() === search || 
          m.user.tag.toLowerCase() === search ||
          m.id === search
        );
        if (targetMember) targetDiscordId = targetMember.id;
      }

      if (targetLink) {
        removeLinkByDiscordId(targetLink.discordId);
      } else {
        removeLinkByMcName(queryName);
      }

      try {
        let roleRemoved = false;
        if (targetMember && targetMember.roles.cache.has(ROLE_ID)) {
          await targetMember.roles.remove(ROLE_ID, `Admin forced unlink by ${interaction.user.tag}`);
          roleRemoved = true;
        }

        const mcNameDisplay = targetLink ? `\`${targetLink.mcName}\`` : `指定名: \`${queryName}\``;
        const userDisplay = targetDiscordId ? `<@${targetDiscordId}>` : `不明 (未検出)`;

        const embed = new EmbedBuilder()
          .setTitle('⚡ 運営による連携強制解除完了')
          .setColor(0x8B0000)
          .addFields(
            { name: '🎮 対象 Minecraft ID', value: mcNameDisplay, inline: true },
            { name: '💬 対象 Discord ユーザー', value: userDisplay, inline: true },
            { name: '🏷️ ロール剥奪結果', value: roleRemoved ? '✅ ロールを自動剥奪しました' : 'ℹ️ ロールは付いていませんでした', inline: false },
            { name: '👮 実行者', value: `<@${interaction.user.id}>`, inline: true }
          )
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });

        if (WEBHOOK_URL) {
          fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ embeds: [embed] })
          }).catch(() => {});
        }
      } catch (err) {
        console.error('Error in /unlinkadmin:', err);
        await interaction.editReply({
          content: `⚠️ ロール削除中にエラーが発生しました。\nエラー: ${err.message}`
        });
      }
    }

    // --- /wholink <name> ---
    else if (commandName === 'wholink') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles) && 
          !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: '❌ このコマンドは運営・管理者専用です。', ephemeral: true });
      }

      await interaction.deferReply({ ephemeral: false });

      const rawInput = interaction.options.getString('name').trim();
      const cleanSearch = rawInput.replace(/^<@!?(\d+)>$/, '$1').replace(/^@/, '').toLowerCase();

      const links = getLinks();
      let targetLink = links.find(l => 
        l.discordId === cleanSearch ||
        l.discordUsername.toLowerCase() === cleanSearch ||
        l.mcName.toLowerCase() === cleanSearch
      );

      if (!targetLink && interaction.guild) {
        const allMembers = await interaction.guild.members.fetch().catch(() => null);
        if (allMembers) {
          const foundMember = allMembers.find(m => 
            m.id === cleanSearch ||
            m.user.username.toLowerCase() === cleanSearch ||
            m.user.tag.toLowerCase() === cleanSearch ||
            (m.nickname && m.nickname.toLowerCase() === cleanSearch) ||
            m.displayName.toLowerCase() === cleanSearch
          );
          if (foundMember) {
            targetLink = links.find(l => l.discordId === foundMember.id);
          }
        }
      }

      if (targetLink) {
        const embed = new EmbedBuilder()
          .setTitle('🔍 プレイヤー連携照会結果')
          .setColor(0x8B0000)
          .addFields(
            { name: '💬 Discord ユーザー名', value: `\`${targetLink.discordUsername}\` (<@${targetLink.discordId}>)`, inline: false },
            { name: '🎮 Minecraft ID (MCID)', value: `\`${targetLink.mcName}\``, inline: false },
            { name: '📅 連携完了日時', value: new Date(targetLink.linkedAt).toLocaleString('ja-JP'), inline: true }
          )
          .setThumbnail(`https://mc-heads.net/avatar/${encodeURIComponent(targetLink.mcName)}/100`)
          .setFooter({ text: `照会対象: ${rawInput}` })
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
      } else {
        await interaction.editReply({
          content: `❌ \`${rawInput}\` に該当する連携情報は見つかりませんでした。`
        });
      }
    }

    // --- /linkinfo ---
    else if (commandName === 'linkinfo') {
      const links = getLinks();
      const myLink = links.find(l => l.discordId === interaction.user.id);

      if (myLink) {
        const embed = new EmbedBuilder()
          .setTitle('🛡️ プレイヤー連携情報')
          .setColor(0x10B981)
          .addFields(
            { name: '🎮 Minecraft ID', value: `\`${myLink.mcName}\``, inline: true },
            { name: '💬 Discord ユーザー名', value: `\`${myLink.discordUsername}\``, inline: true },
            { name: '📅 連携日時', value: new Date(myLink.linkedAt).toLocaleString('ja-JP'), inline: false }
          )
          .setThumbnail(`https://mc-heads.net/avatar/${encodeURIComponent(myLink.mcName)}/100`);

        await interaction.reply({ embeds: [embed], ephemeral: true });
      } else {
        await interaction.reply({
          content: 'ℹ️ あなたのアカウントはまだ連携されていません。Webサイトからトークンを発行して `/link <token>` を実行してください。',
          ephemeral: true
        });
      }
    }

    // --- /linklist ---
    else if (commandName === 'linklist') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
        return interaction.reply({ content: '❌ 権限がありません。', ephemeral: true });
      }

      const links = getLinks();
      if (links.length === 0) {
        return interaction.reply({ content: '登録されている連携データはありません。', ephemeral: true });
      }

      const listText = links.slice(0, 25).map((l, i) => 
        `${i + 1}. **${l.mcName}** ↔ <@${l.discordId}> (\`${l.discordUsername}\`)`
      ).join('\n');

      const embed = new EmbedBuilder()
        .setTitle(`📋 連携プレイヤー一覧 (${links.length}件)`)
        .setColor(0x8B0000)
        .setDescription(listText + (links.length > 25 ? `\n...他 ${links.length - 25} 件` : ''))
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }

  // 2. Modal Submission (/giveaway modal)
  else if (interaction.isModalSubmit()) {
    if (interaction.customId === 'giveaway_modal') {
      await interaction.deferReply({ ephemeral: true });

      const durationStr = interaction.fields.getTextInputValue('duration');
      const winnersStr = interaction.fields.getTextInputValue('winners');
      const prize = interaction.fields.getTextInputValue('prize');
      const description = interaction.fields.getTextInputValue('description') || '';

      const durationMs = parseDuration(durationStr);
      if (!durationMs || durationMs < 5000) {
        return interaction.editReply({
          content: '❌ **Duration（期間）の形式が無効です。**\n例: `10 minutes`, `1h`, `2d`, `30s` などの形式で入力してください。'
        });
      }

      const winnersCount = parseInt(winnersStr.trim(), 10);
      if (isNaN(winnersCount) || winnersCount < 1) {
        return interaction.editReply({
          content: '❌ **当選者数（Number of Winners）は1以上の数字を入力してください。**'
        });
      }

      // Extract multiple selected roles from Modal GUI
      let selectedRoleIds = [];

      try {
        if (typeof interaction.fields.getSelectedRoles === 'function') {
          const rolesColl = interaction.fields.getSelectedRoles('required_roles');
          if (rolesColl && rolesColl.size > 0) {
            selectedRoleIds = Array.from(rolesColl.keys());
          }
        }
      } catch (e) {}

      if (selectedRoleIds.length === 0) {
        try {
          const field = interaction.fields.getField('required_roles');
          if (field && Array.isArray(field.values)) {
            selectedRoleIds = field.values;
          }
        } catch (e) {}
      }

      if (selectedRoleIds.length === 0 && interaction.data && interaction.data.components) {
        for (const row of interaction.data.components) {
          if (row.custom_id === 'required_roles' && Array.isArray(row.values)) {
            selectedRoleIds = row.values;
          } else if (row.component && row.component.custom_id === 'required_roles' && Array.isArray(row.component.values)) {
            selectedRoleIds = row.component.values;
          } else if (row.components) {
            for (const c of row.components) {
              if (c.custom_id === 'required_roles' && Array.isArray(c.values)) {
                selectedRoleIds = c.values;
              }
            }
          }
        }
      }

      // Check fallback text input if component was not used
      if (selectedRoleIds.length === 0) {
        try {
          const textInput = interaction.fields.getTextInputValue('required_roles_text');
          if (textInput && textInput.trim()) {
            const parts = textInput.split(/[,、\s]+/);
            for (const p of parts) {
              const clean = p.replace(/^<@&(\d+)>$/, '$1').trim();
              if (!clean) continue;
              const r = interaction.guild ? (interaction.guild.roles.cache.get(clean) || interaction.guild.roles.cache.find(role => role.name.toLowerCase() === clean.toLowerCase())) : null;
              if (r) {
                selectedRoleIds.push(r.id);
              } else if (/^\d+$/.test(clean)) {
                selectedRoleIds.push(clean);
              }
            }
          }
        } catch (e) {}
      }

      const giveawayId = `ga_${Date.now()}`;
      const endTime = Date.now() + durationMs;

      const giveawayData = {
        id: giveawayId,
        channelId: interaction.channelId,
        messageId: null,
        hostId: interaction.user.id,
        prize: prize,
        description: description,
        winnersCount: winnersCount,
        requiredRoleIds: selectedRoleIds,
        endTime: endTime,
        entries: [],
        ended: false,
        winners: []
      };

      const embed = createGiveawayEmbed(giveawayData, false);
      const enterBtn = new ButtonBuilder()
        .setCustomId(`giveaway_enter_${giveawayId}`)
        .setLabel('🎉 参加する (0)')
        .setStyle(ButtonStyle.Primary);

      const actionRow = new ActionRowBuilder().addComponents(enterBtn);

      // Send to current channel
      const msg = await interaction.channel.send({
        embeds: [embed],
        components: [actionRow]
      });

      giveawayData.messageId = msg.id;

      const giveaways = getGiveaways();
      giveaways.push(giveawayData);
      saveGiveaways(giveaways);

      // Set timeout for end
      setTimeout(() => endGiveaway(giveawayId), durationMs);

      await interaction.editReply({
        content: `✅ ギブアウェイを開始しました！ [メッセージへ移動](${msg.url})`
      });
    }
  }

  // 3. Button Click (Giveaway Enter / Leave Toggle)
  else if (interaction.isButton()) {
    if (interaction.customId.startsWith('giveaway_enter_')) {
      const giveawayId = interaction.customId.replace('giveaway_enter_', '');
      const giveaways = getGiveaways();
      const giveaway = giveaways.find(g => g.id === giveawayId);

      if (!giveaway || giveaway.ended) {
        return interaction.reply({
          content: '⚠️ このギブアウェイは既に終了しています。',
          ephemeral: true
        });
      }

      // Check Required Roles (Multiple selection check)
      const requiredRoles = giveaway.requiredRoleIds || (giveaway.requiredRoleId ? [giveaway.requiredRoleId] : []);
      if (requiredRoles.length > 0) {
        const member = interaction.member;
        const missingRoles = requiredRoles.filter(id => !member.roles.cache.has(id));
        if (missingRoles.length > 0) {
          return interaction.reply({
            content: `❌ このギブアウェイに参加するには、次のロールが必要です:\n${missingRoles.map(id => `<@&${id}>`).join(' ')}`,
            ephemeral: true
          });
        }
      }

      const userId = interaction.user.id;
      const index = giveaway.entries.indexOf(userId);

      let msgText = '';
      if (index === -1) {
        // Enter
        giveaway.entries.push(userId);
        msgText = `🎉 **${giveaway.prize}** のギブアウェイに参加しました！`;
      } else {
        // Leave
        giveaway.entries.splice(index, 1);
        msgText = `↩️ ギブアウェイの参加を取り消しました。`;
      }

      saveGiveaways(giveaways);

      // Update message button count & embed
      try {
        const newEmbed = createGiveawayEmbed(giveaway, false);
        const newBtn = new ButtonBuilder()
          .setCustomId(`giveaway_enter_${giveawayId}`)
          .setLabel(`🎉 参加する (${giveaway.entries.length})`)
          .setStyle(ButtonStyle.Primary);

        const newRow = new ActionRowBuilder().addComponents(newBtn);

        await interaction.update({
          embeds: [newEmbed],
          components: [newRow]
        });

        // Send confirmation followup
        await interaction.followUp({
          content: msgText,
          ephemeral: true
        });
      } catch (err) {
        console.error('Error updating giveaway entry:', err);
      }
    }
  }
  } catch (err) {
    if (err.code === 10062) {
      console.warn('⚠️ Interaction expired or unknown (10062), safely ignored.');
      return;
    }
    console.error('⚠️ Interaction Error:', err);
  }
});

client.login(TOKEN);
