/**
 * ArchMC Discord Auth & Moderation Bot
 * 
 * Commands:
 *  - /link <mc_name>        : Link Minecraft account & auto-assign verified role
 *  - /unlink                : Self unlink & auto-remove role
 *  - /unlinkadmin <name>    : [Admin] Force unlink a player by MCID or Discord name & auto-remove role
 *  - /linkinfo              : Check current link status
 *  - /linklist              : [Admin] View all registered links
 * 
 * Web API:
 *  - POST /api/verify       : API for GitHub Pages Website
 */

require('dotenv').config();
const { 
  Client, 
  GatewayIntentBits, 
  REST, 
  Routes, 
  SlashCommandBuilder, 
  PermissionFlagsBits, 
  EmbedBuilder 
} = require('discord.js');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID || '1569551679840591892';
const ROLE_ID = process.env.ROLE_ID || '1568130111243554868';
const WEBHOOK_URL = process.env.WEBHOOK_URL;
const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'links.json');

// Ensure data directory & file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf8');
}

// Data Helper Functions
function getLinks() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
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

function removeLinkByName(name) {
  const links = getLinks();
  const search = name.toLowerCase().trim().replace(/^@/, '');
  const target = links.find(l => 
    l.mcName.toLowerCase() === search || 
    l.discordUsername.toLowerCase() === search ||
    l.discordId === search
  );
  if (target) {
    saveLinks(links.filter(l => l !== target));
    return target;
  }
  return null;
}

// Discord Client Setup
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
    .setName('link')
    .setDescription('Minecraftアカウントを連携してロールを自動で受け取ります。')
    .addStringOption(option =>
      option.setName('mc_name')
        .setDescription('あなたのMinecraftゲーム内名前（MCID）')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('unlink')
    .setDescription('自分のMinecraftアカウントとの連携を解除し、ロールを削除します。'),

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
    .setName('linkinfo')
    .setDescription('現在のMinecraft連携情報を確認します。'),

  new SlashCommandBuilder()
    .setName('wholink')
    .setDescription('【運営専用】Discordユーザーの連携情報（Discord名 & Minecraft ID）を照会します。')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('照会したいDiscordユーザー名（例: metasukech_52692）、メンション、またはID')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  new SlashCommandBuilder()
    .setName('linklist')
    .setDescription('【運営専用】現在連携されているプレイヤー一覧を確認します。')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
].map(command => command.toJSON());

// Register Slash Commands
async function registerSlashCommands() {
  const rest = new REST({ version: '10' }).setToken(TOKEN);
  try {
    console.log('Registering application slash commands...');
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );
    console.log('✅ Successfully registered all slash commands (/link, /unlink, /unlinkadmin, /linkinfo, /linklist)!');
  } catch (error) {
    console.error('Error registering slash commands:', error);
  }
}

// Ready Event
client.once('ready', async () => {
  console.log(`=========================================`);
  console.log(` ArchMC Auth Bot is Online as ${client.user.tag}`);
  console.log(` Target Role ID: ${ROLE_ID}`);
  console.log(`=========================================`);
  await registerSlashCommands();
});

// Interaction Create Event (Slash Commands Handling)
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  // 1. /link <mc_name> (Direct Link via Discord)
  if (commandName === 'link') {
    await interaction.deferReply({ ephemeral: true });

    const mcName = interaction.options.getString('mc_name').trim();
    const member = interaction.member;

    try {
      // Add role
      if (!member.roles.cache.has(ROLE_ID)) {
        await member.roles.add(ROLE_ID, `Linked MCID: ${mcName}`);
      }

      // Save Link
      addLink(interaction.user.id, interaction.user.username, mcName);

      const embed = new EmbedBuilder()
        .setTitle('⚡ 認証＆ロール付与完了！')
        .setColor(0x10B981)
        .addFields(
          { name: '🎮 Minecraft ID', value: `\`${mcName}\``, inline: true },
          { name: '💬 Discord', value: `<@${interaction.user.id}>`, inline: true },
          { name: '🏷️ 付与ロール', value: `<@&${ROLE_ID}>`, inline: false }
        )
        .setThumbnail(`https://mc-heads.net/avatar/${encodeURIComponent(mcName)}/100`)
        .setFooter({ text: '解除したい場合はいつでも /unlink を実行してください' });

      await interaction.editReply({ embeds: [embed] });

      // Send to webhook log
      if (WEBHOOK_URL) {
        fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: `⚡ **【連携完了】** <@${interaction.user.id}> が \`${mcName}\` で連携しました。ロール <@&${ROLE_ID}> を付与しました。`
          })
        }).catch(() => {});
      }
    } catch (err) {
      console.error('Error in /link:', err);
      await interaction.editReply({
        content: `⚠️ ロール付与中にエラーが発生しました。\nBotのロールがサーバー設定で対象ロール（<@&${ROLE_ID}>）よりも上に配置されているか確認してください。\nエラー: ${err.message}`
      });
    }
  }

  // 2. /unlink (Self Unlink)
  else if (commandName === 'unlink') {
    await interaction.deferReply({ ephemeral: true });

    const member = interaction.member;
    const removed = removeLinkByDiscordId(interaction.user.id);

    try {
      let roleRemoved = false;
      if (member.roles.cache.has(ROLE_ID)) {
        await member.roles.remove(ROLE_ID, 'Self-unlinked via /unlink');
        roleRemoved = true;
      }

      const mcInfo = removed ? ` (Minecraft ID: \`${removed.mcName}\`)` : '';
      await interaction.editReply({
        content: `✅ 連携を解除しました${mcInfo}。\n${roleRemoved ? '付与されていたロールを自動で削除しました。' : 'ロールは既に解除されていました。'}`
      });

      // Send log to webhook
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
        content: `⚠️ ロール削除中にエラーが発生しました。Botのロール順位を確認してください。\nエラー: ${err.message}`
      });
    }
  }

  // 3. /unlinkadmin <name> (Admin Force Unlink)
  else if (commandName === 'unlinkadmin') {
    await interaction.deferReply({ ephemeral: false });

    // Check admin permissions
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles) && 
        !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.editReply({
        content: '❌ このコマンドを実行する権限（ロールの管理）がありません。'
      });
    }

    const queryName = interaction.options.getString('name').trim();
    const removed = removeLinkByName(queryName);

    let targetDiscordId = removed ? removed.discordId : null;
    let targetMember = null;

    // Fetch guild members
    const allMembers = await interaction.guild.members.fetch().catch(() => null);

    if (targetDiscordId && allMembers) {
      targetMember = allMembers.get(targetDiscordId);
    } else if (allMembers) {
      const search = queryName.toLowerCase().replace(/^@/, '');
      targetMember = allMembers.find(m => 
        m.user.username.toLowerCase() === search || 
        m.user.tag.toLowerCase() === search ||
        m.id === search
      );
      if (targetMember) targetDiscordId = targetMember.id;
    }

    try {
      let roleRemoved = false;
      if (targetMember && targetMember.roles.cache.has(ROLE_ID)) {
        await targetMember.roles.remove(ROLE_ID, `Forced unlink by Admin: ${interaction.user.tag}`);
        roleRemoved = true;
      }

      const mcNameDisplay = removed ? `\`${removed.mcName}\`` : `指定名: \`${queryName}\``;
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

  // 4. /linkinfo (Check own link)
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
        content: 'ℹ️ あなたのアカウントはまだ連携されていません。`/link <MCID>` またはWebサイトから認証を行ってください。',
        ephemeral: true
      });
    }
  }

  // 5. /wholink <name> (Admin Only: Lookup player link info by Discord name)
  else if (commandName === 'wholink') {
    // Check admin permissions
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles) && 
        !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: '❌ このコマンドは運営・管理者専用です。',
        ephemeral: true
      });
    }

    await interaction.deferReply({ ephemeral: false });

    const rawInput = interaction.options.getString('name').trim();
    // Clean up input: remove @, <@!id>, etc.
    const cleanSearch = rawInput.replace(/^<@!?(\d+)>$/, '$1').replace(/^@/, '').toLowerCase();

    const links = getLinks();
    let targetLink = links.find(l => 
      l.discordId === cleanSearch ||
      l.discordUsername.toLowerCase() === cleanSearch ||
      l.mcName.toLowerCase() === cleanSearch
    );

    // If not found directly in links.json, try finding in guild members first
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
        content: `❌ \`${rawInput}\` に該当する連携情報は見つかりませんでした。\nユーザー名が正しいか、既に連携済みかご確認ください。`
      });
    }
  }

  // 6. /linklist (Admin View All)
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
});

// ==========================================
// Web API Server (For Web Authentication)
// ==========================================
const app = express();
app.use(cors());
app.use(express.json());

// Health Check
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    bot: client.user ? client.user.tag : 'connecting',
    timestamp: new Date().toISOString()
  });
});

// POST /api/verify - Called from Website
app.post('/api/verify', async (req, res) => {
  const { mcName, discordUsername } = req.body;

  if (!mcName || !discordUsername) {
    return res.status(400).json({
      success: false,
      error: 'Minecraft IDとDiscordユーザー名は必須です。'
    });
  }

  try {
    const cleanUsername = discordUsername.toLowerCase().trim().replace(/^@/, '');
    let targetMember = null;

    // Search member across all guilds bot is in
    for (const guild of client.guilds.cache.values()) {
      try {
        const members = await guild.members.fetch();
        const found = members.find(m => 
          m.user.username.toLowerCase() === cleanUsername ||
          m.user.tag.toLowerCase() === cleanUsername ||
          m.id === cleanUsername
        );
        if (found) {
          targetMember = found;
          break;
        }
      } catch (err) {
        console.error(`Error fetching members for guild ${guild.id}:`, err);
      }
    }

    if (!targetMember) {
      return res.status(404).json({
        success: false,
        error: `Discordサーバー内に「${discordUsername}」というユーザーが見つかりませんでした。先にDiscordサーバーに参加してください！`
      });
    }

    // Assign Role
    if (!targetMember.roles.cache.has(ROLE_ID)) {
      await targetMember.roles.add(ROLE_ID, `Web Verified: Minecraft ID ${mcName}`);
    }

    // Save Link Data
    addLink(targetMember.id, targetMember.user.username, mcName);

    // Send Webhook log
    if (WEBHOOK_URL) {
      const embed = new EmbedBuilder()
        .setTitle('⚡ プレイヤー認証＆ロール自動付与完了')
        .setColor(0x10B981)
        .addFields(
          { name: '🎮 ArchMC ゲーム内名前', value: `\`${mcName}\``, inline: true },
          { name: '💬 Discord ユーザー', value: `<@${targetMember.id}> (\`${targetMember.user.username}\`)`, inline: true },
          { name: '🏷️ 付与ロール', value: `<@&${ROLE_ID}>`, inline: false }
        )
        .setThumbnail(`https://mc-heads.net/avatar/${encodeURIComponent(mcName)}/100`)
        .setTimestamp();

      fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `⚡ **【自動連携完了】** <@${targetMember.id}> にロール <@&${ROLE_ID}> を付与しました！`,
          embeds: [embed]
        })
      }).catch(() => {});
    }

    return res.json({
      success: true,
      message: 'Role granted successfully!',
      user: {
        id: targetMember.id,
        username: targetMember.user.username,
        mcName: mcName
      }
    });

  } catch (error) {
    console.error('Error in /api/verify:', error);
    return res.status(500).json({
      success: false,
      error: `ロール付与に失敗しました: ${error.message}（Botのロール順位をご確認ください）`
    });
  }
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`API Server running on port ${PORT}`);
});

// Login Discord Bot
client.login(TOKEN);
