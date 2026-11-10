/**
 * ArchMC JP/EN Community - Internationalization (i18n)
 * Supported languages: JA (Japanese), EN (English), ZH (Simplified Chinese), KO (Korean)
 */

const I18N_DATA = {
  ja: {
    lang_name: "日本語",
    brand_sub: "JP/EN Community",
    nav_home: "ホーム",
    nav_auth: "プレイヤー認証",
    nav_features: "特徴",
    nav_rules: "ルール",
    nav_discord: "Discord参加",

    // Index Hero
    hero_badge: "プレイヤー有志コミュニティ",
    hero_title_1: "ArchMC",
    hero_title_2: "JP / EN Community",
    hero_desc: "ArchMCの日本人・海外プレイヤーをつなぐ派生コミュニティです。ゲーム内アカウントとコミュニティDiscordを連携して、限定ロールを受け取ろう！",
    hero_btn_verify: "プレイヤー認証へ進む",
    hero_btn_discord: "Discordに参加する",
    hero_server_ip: "サーバーIP: archmc.net",
    hero_copy_ip: "IPをコピー",
    hero_ip_copied: "コピーしました！",

    // Index Features
    features_tag: "COMMUNITY FEATURES",
    features_heading: "コミュニティの魅力",
    features_subheading: "安心して楽しめる国際的なMinecraftコミュニティ",
    feat_1_title: "日米・グローバル交流",
    feat_1_desc: "日本語と英語をはじめ、多言語プレイヤーがPvPや建築、雑談を気軽に楽しめる環境を整えています。",
    feat_2_title: "ワンクリック認証システム",
    feat_2_desc: "ArchMCのMCIDとDiscord IDを連携することで、認証者限定ロールを付与。円滑なコミュニティ運営を実現します。",
    feat_3_title: "イベント & トーナメント",
    feat_3_desc: "定期的な対戦トーナメントやカスタムマッチ、プレゼント企画などをコミュニティ主導で開催しています。",

    // Index How to verify
    how_tag: "VERIFICATION STEPS",
    how_heading: "認証の簡単な流れ",
    how_step_1_title: "1. 情報を準備",
    how_step_1_desc: "ArchMCで使用しているMinecraft IDと、Discordのユーザー名（例: metasukech_52692）を確認します。",
    how_step_2_title: "2. 認証ページで送信",
    how_step_2_desc: "認証フォームに入力して送信ボタンを押すと、自動的に連携処理が行われます。",
    how_step_3_title: "3. ロール自動付与",
    how_step_3_desc: "認証完了と同時に専用ロール（Role ID: 1568130111243554868）が付与されます。Cookieに認証情報が保存されます。",

    // Index Rules
    rules_tag: "RULES & GUIDELINES",
    rules_heading: "コミュニティルール",
    rule_1_title: "フェアプレイの徹底",
    rule_1_desc: "ハック、不正クライアント、マクロ等の禁止ツール使用は厳しく対処されます。",
    rule_2_title: "誹謗中傷・ハラスメントの禁止",
    rule_2_desc: "すべてのプレイヤーに敬意を払い、差別発言や暴言、荒らし行為を行わないでください。",
    rule_3_title: "多言語チャンネルのマナー",
    rule_3_desc: "各チャンネルの言語設定を守り、翻訳ツール等を活用しながら仲良くコミュニケーションをとりましょう。",

    // Auth Page
    auth_badge: "SECURE VERIFICATION",
    auth_title: "ArchMC プレイヤー認証",
    auth_desc: "Minecraft IDとDiscordユーザー名を連携し、コミュニティロールを自動で受け取りましょう。※認証解除はDiscordサーバー内でAdminがロールを外すことで行われます。",

    form_avatar_title: "アバタープレビュー",
    form_avatar_hint: "MCIDを入力するとスキンが表示されます",

    label_mcid: "ArchMC Minecraft ID (MCID)",
    placeholder_mcid: "例: Steve",
    hint_mcid: "大文字・小文字を正確に入力してください",

    label_discord_id: "Discord ユーザー名",
    placeholder_discord_id: "例: metasukech_52692",
    hint_discord_id: "Discordのユーザー名（小文字・数字・アンダースコア）を入力してください",
    link_discord_help: "Discordユーザー名の確認方法は？",

    label_role_grant: "付与されるロール",
    role_name_badge: "Verified Player",
    role_id_note: "Role ID: 1568130111243554868",

    btn_submit_verify: "認証してロールを受け取る",
    btn_submitting_verify: "自動連携処理中...",

    // Verified Status Card
    verified_status_badge: "認証済み",
    verified_status_title: "認証が完了しています",
    verified_status_desc: "この端末では現在Cookieによって連携情報が保存されています。",
    info_mcid_label: "登録MCID",
    info_discord_label: "登録Discord ユーザー名",
    info_role_label: "付与ロール",
    info_date_label: "認証日時",
    admin_unlink_notice: "認証の解除は、Discordサーバー内でAdmin（管理者）などの権限保持者がロール（Verified Player）を外すことでのみ行われます。サイトからの解除操作はできません。",

    // Discord ID Help Modal
    modal_help_title: "Discord ユーザー名の確認手順",
    modal_step_1: "Discord画面の左下（PC版）または右下プロフィールアイコン（スマホ版）を開きます。",
    modal_step_2: "表示名の下に小さく表示されている半角英数字（例: metasukech_52692）が「ユーザー名」です。",
    modal_step_3: "クリックまたは長押しでユーザー名をコピーできます。",
    modal_help_note: "※ ニックネーム（表示名）ではなく固有のユーザー名（例: metasukech_52692）を入力してください。",
    btn_modal_close: "理解しました",

    // Alerts / Toasts
    alert_empty_fields: "すべての入力欄を正しく入力してください。",
    alert_invalid_discord: "Discordユーザー名を正しく入力してください（例: metasukech_52692）。",
    alert_verify_success: "🎉 認証が完了しました！Discordロール（1568130111243554868）が付与されました。",
    alert_network_error: "Webhookの送信に失敗しました。時間をおいて再試行してください。",

    // Footer
    footer_text: "ArchMC JP/EN Community. 非公式ファンコミュニティサイトです。MinecraftおよびMojang Studiosとは関連ありません。",
    footer_quick_links: "クイックリンク",
    footer_community: "コミュニティ"
  },

  en: {
    lang_name: "English",
    brand_sub: "JP/EN Community",
    nav_home: "Home",
    nav_auth: "Verification",
    nav_features: "Features",
    nav_rules: "Rules",
    nav_discord: "Join Discord",

    // Index Hero
    hero_badge: "Player Community Portal",
    hero_title_1: "ArchMC",
    hero_title_2: "JP / EN Community",
    hero_desc: "An unofficial spin-off community for Japanese and international players of ArchMC! Link your Minecraft account with our community Discord to claim your verified role.",
    hero_btn_verify: "Get Verified Now",
    hero_btn_discord: "Join Discord Server",
    hero_server_ip: "Server IP: archmc.net",
    hero_copy_ip: "Copy IP",
    hero_ip_copied: "Copied!",

    // Index Features
    features_tag: "COMMUNITY FEATURES",
    features_heading: "Why Join Our Community?",
    features_subheading: "A welcoming, global Minecraft community for everyone",
    feat_1_title: "Global Bilingual Community",
    feat_1_desc: "Enjoy PvP, builds, and chat with Japanese, English, Chinese, and Korean-speaking players in a friendly environment.",
    feat_2_title: "Instant Verification System",
    feat_2_desc: "Link your ArchMC in-game name with your Discord ID to instantly receive your verified role and unlock channels.",
    feat_3_title: "Events & Tournaments",
    feat_3_desc: "Regular PvP tournaments, custom minigames, and giveaways organized directly by the community staff.",

    // Index How to verify
    how_tag: "VERIFICATION STEPS",
    how_heading: "Simple 3-Step Verification",
    how_step_1_title: "1. Prepare Your Info",
    how_step_1_desc: "Check your ArchMC in-game Minecraft username and your Discord username (e.g. metasukech_52692).",
    how_step_2_title: "2. Submit on Auth Page",
    how_step_2_desc: "Fill in the form and click verify. Your account is automatically linked.",
    how_step_3_title: "3. Role Granted & Saved",
    how_step_3_desc: "Your Discord account receives the community role (Role ID: 1568130111243554868). Status is saved in cookies.",

    // Index Rules
    rules_tag: "RULES & GUIDELINES",
    rules_heading: "Community Guidelines",
    rule_1_title: "Fair Play & Sportsmanship",
    rule_1_desc: "No hacking, auto-clickers, or unfair client modifications. Play fair and respect other players.",
    rule_2_title: "No Harassment or Toxicity",
    rule_2_desc: "Treat everyone with respect. Discrimination, offensive language, and trolling will result in moderation action.",
    rule_3_title: "Respect Language Channels",
    rule_3_desc: "Please use appropriate channels for specific languages and be welcoming to translation tools.",

    // Auth Page
    auth_badge: "SECURE VERIFICATION",
    auth_title: "ArchMC Player Verification",
    auth_desc: "Link your Minecraft username and Discord username to automatically receive your community role. Unlinking is only performed by an Admin removing your role in Discord.",

    form_avatar_title: "Skin Preview",
    form_avatar_hint: "Skin will appear when you enter your MCID",

    label_mcid: "ArchMC Minecraft Username (MCID)",
    placeholder_mcid: "e.g. Steve",
    hint_mcid: "Please match exact casing (capital/lowercase)",

    label_discord_id: "Discord Username",
    placeholder_discord_id: "e.g. metasukech_52692",
    hint_discord_id: "Enter your Discord username (lowercase letters, numbers, underscores)",
    link_discord_help: "How do I find my Discord username?",

    label_role_grant: "Role to be Granted",
    role_name_badge: "Verified Player",
    role_id_note: "Role ID: 1568130111243554868",

    btn_submit_verify: "Verify & Claim Role",
    btn_submitting_verify: "Processing Auto-Link...",

    // Verified Status Card
    verified_status_badge: "VERIFIED",
    verified_status_title: "Account is Verified",
    verified_status_desc: "This device is linked via cookie. Unlinking is handled exclusively by Admins in Discord.",
    info_mcid_label: "Linked MCID",
    info_discord_label: "Linked Discord Username",
    info_role_label: "Granted Role",
    info_date_label: "Verified Date",
    admin_unlink_notice: "Unlinking is performed exclusively by Discord Administrators removing the 'Verified Player' role. Manual unlinking from this website is disabled.",

    // Discord ID Help Modal
    modal_help_title: "How to Find Your Discord Username",
    modal_step_1: "Look at the bottom-left of Discord (PC) or profile tab (Mobile).",
    modal_step_2: "Below your display name, you will find your handle (e.g. metasukech_52692).",
    modal_step_3: "Click or tap to copy your exact username.",
    modal_help_note: "Note: Enter your unique username (e.g. metasukech_52692), NOT your server nickname.",
    btn_modal_close: "Got it!",

    // Alerts / Toasts
    alert_empty_fields: "Please fill in all required fields.",
    alert_invalid_discord: "Please enter a valid Discord username (e.g. metasukech_52692).",
    alert_verify_success: "🎉 Verification complete! Discord role (1568130111243554868) granted.",
    alert_network_error: "Failed to send request via Webhook. Please try again later.",

    // Footer
    footer_text: "ArchMC JP/EN Community. Unofficial fan community site. Not affiliated with Mojang Studios or Microsoft.",
    footer_quick_links: "Quick Links",
    footer_community: "Community"
  },

  zh: {
    lang_name: "简体中文",
    brand_sub: "JP/EN Community",
    nav_home: "首页",
    nav_auth: "玩家认证",
    nav_features: "特色",
    nav_rules: "社区规则",
    nav_discord: "加入Discord",

    // Index Hero
    hero_badge: "官方社区门户",
    hero_title_1: "ArchMC",
    hero_title_2: "JP / EN Community",
    hero_desc: "连接ArchMC的日本与国际玩家！绑定您的Minecraft游戏ID与Discord，获取专属社区身份组并参与丰富活动。",
    hero_btn_verify: "立即进行玩家认证",
    hero_btn_discord: "加入Discord服务器",
    hero_server_ip: "服务器IP: archmc.net",
    hero_copy_ip: "复制IP",
    hero_ip_copied: "已复制！",

    // Index Features
    features_tag: "COMMUNITY FEATURES",
    features_heading: "社区特色",
    features_subheading: "安全友好的国际Minecraft交流社区",
    feat_1_title: "全球双语交流",
    feat_1_desc: "为日语、英语、中文和韩语玩家提供友好的PvP切磋、建筑交流与交友环境。",
    feat_2_title: "便捷快速的认证系统",
    feat_2_desc: "只需将您的MCID与Discord ID绑定，即可自动授予认证身份组，保障良好的社区氛围。",
    feat_3_title: "定期活动与锦标赛",
    feat_3_desc: "定期举办社区专属PvP竞技比赛、趣味小游戏和福利抽奖活动。",

    // Index How to verify
    how_tag: "VERIFICATION STEPS",
    how_heading: "轻松3步完成认证",
    how_step_1_title: "1. 准备个人信息",
    how_step_1_desc: "确认您在ArchMC游戏内的Minecraft名称及Discord用户ID（17-20位纯数字）。",
    how_step_2_title: "2. 在认证页面提交",
    how_step_2_desc: "填写认证表单并点击提交，系统将通过安全Webhook进行记录与同步。",
    how_step_3_title: "3. 获得专属身份组",
    how_step_3_desc: "认证成功后将自动获得社区专属身份组（Role ID: 1568130111243554868），可随时解除绑定。",

    // Index Rules
    rules_tag: "RULES & GUIDELINES",
    rules_heading: "社区规则与指引",
    rule_1_title: "公平竞技，恪守体育道德",
    rule_1_desc: "严禁使用任何连点器、作弊客户端或外挂插件。营造公平对局环境。",
    rule_2_title: "严禁人身攻击与恶意骚扰",
    rule_2_desc: "请互相尊重，禁止发布带有歧视、侮辱或破坏社区氛围的言论。",
    rule_3_title: "遵守多语言频道规则",
    rule_3_desc: "在对应语言的频道内友好交流，善用翻译工具互相包容。",

    // Auth Page
    auth_badge: "SECURE VERIFICATION",
    auth_title: "ArchMC 玩家认证系统",
    auth_desc: "绑定您的Minecraft ID与Discord ID以领取社区专属身份组。支持随时解除绑定。",

    tab_verify: "账号认证",
    tab_unlink: "解除绑定",

    form_avatar_title: "皮肤预览",
    form_avatar_hint: "输入MCID后将自动显示您的皮肤头像",

    label_mcid: "ArchMC Minecraft ID (MCID)",
    placeholder_mcid: "例如: Steve",
    hint_mcid: "请注意区分英文字母的大小写",

    label_discord_id: "Discord 用户ID (User ID)",
    placeholder_discord_id: "例如: 123456789012345678 (17-20位数字)",
    hint_discord_id: "请输入纯数字的用户ID，而非用户名",
    link_discord_help: "如何查看我的Discord ID？",

    label_role_grant: "将获得的身份组",
    role_name_badge: "Verified Player",
    role_id_note: "Role ID: 1568130111243554868",

    btn_submit_verify: "完成认证并领取身份组",
    btn_submitting_verify: "正在提交认证...",
    btn_submit_unlink: "解除绑定",
    btn_submitting_unlink: "正在解除绑定...",

    // Verified Status Card
    verified_status_badge: "已认证",
    verified_status_title: "您的账号已认证",
    verified_status_desc: "当前设备已绑定以下信息。您可以随时在此解除绑定。",
    info_mcid_label: "绑定MCID",
    info_discord_label: "绑定Discord ID",
    info_role_label: "已赋予身份组",
    info_date_label: "认证时间",
    btn_show_unlink: "解除当前绑定",

    // Unlink Manual Tab
    unlink_title: "手动解除绑定",
    unlink_desc: "输入您已绑定的Minecraft ID和Discord ID以解除绑定。相应的Discord身份组将被移除。",

    // Discord ID Help Modal
    modal_help_title: "如何获取Discord用户ID",
    modal_step_1: "打开Discord左下角「用户设置（⚙️齿轮图标）」。",
    modal_step_2: "点击左侧「高级设置」，开启「开发者模式」。",
    modal_step_3: "右键点击自己的头像或用户名（手机端长按），选择「复制用户ID」。",
    modal_help_note: "注意：必须是17-20位的纯数字，不能是昵称或带有#的用户名。",
    btn_modal_close: "我知道了",

    // Alerts / Toasts
    alert_empty_fields: "请完整填写所有必填项。",
    alert_invalid_discord: "Discord ID必须为17-20位半角纯数字。",
    alert_verify_success: "🎉 认证成功！已为您赋予Discord身份组（1568130111243554868）。",
    alert_unlink_confirm: "确定要解除认证吗？您所获得的Discord身份组将被收回。",
    alert_unlink_success: "✅ 解绑成功！已取消您的Discord认证关联。",
    alert_network_error: "Webhook发送失败，请稍后重试。",

    // Footer
    footer_text: "ArchMC JP/EN Community. 非官方粉丝社区网站，与Mojang Studios或微软无隶属关系。",
    footer_quick_links: "快捷链接",
    footer_community: "社区板块"
  },

  ko: {
    lang_name: "한국어",
    brand_sub: "JP/EN Community",
    nav_home: "홈",
    nav_auth: "플레이어 인증",
    nav_features: "특징",
    nav_rules: "규칙",
    nav_discord: "디스코드 참여",

    // Index Hero
    hero_badge: "공식 커뮤니티 포털",
    hero_title_1: "ArchMC",
    hero_title_2: "JP / EN Community",
    hero_desc: "ArchMC의 일본 및 글로벌 플레이어를 연결하는 커뮤니티입니다. 마인크래프트 계정과 디스코드를 연동하여 전용 역할을 획득하고 이벤트에 참여하세요!",
    hero_btn_verify: "지금 인증하기",
    hero_btn_discord: "디스코드 서버 참여",
    hero_server_ip: "서버 IP: archmc.net",
    hero_copy_ip: "IP 복사",
    hero_ip_copied: "복사 완료!",

    // Index Features
    features_tag: "COMMUNITY FEATURES",
    features_heading: "커뮤니티의 장점",
    features_subheading: "안전하고 즐거운 글로벌 마인크래프트 커뮤니티",
    feat_1_title: "글로벌 다국어 교류",
    feat_1_desc: "일본어, 영어, 한국어, 중국어 플레이어가 함께 PvP, 건축, 소통을 즐길 수 있는 환경을 제공합니다.",
    feat_2_title: "간편한 원클릭 인증 시스템",
    feat_2_desc: "ArchMC MCID와 디스코드 ID를 연동하여 인증 전용 역할을 즉시 부여받을 수 있습니다.",
    feat_3_title: "정기 이벤트 & 토너먼트",
    feat_3_desc: "커뮤니티 전용 PvP 대회, 커스텀 미니게임, 다채로운 경품 이벤트가 정기적으로 개최됩니다.",

    // Index How to verify
    how_tag: "VERIFICATION STEPS",
    how_heading: "간단한 3단계 인증",
    how_step_1_title: "1. 정보 준비",
    how_step_1_desc: "ArchMC에서 사용하는 마인크래프트 닉네임과 17~20자리 디스코드 유저 ID를 확인합니다.",
    how_step_2_title: "2. 인증 페이지에서 제출",
    how_step_2_desc: "양식을 작성하고 제출 버튼을 누르면 전용 웹훅을 통해 안전하게 처리됩니다.",
    how_step_3_title: "3. 역할 부여 완료",
    how_step_3_desc: "인증 완료 시 디스코드 서버 역할(Role ID: 1568130111243554868)이 부여되며, 언제든지 해제할 수 있습니다.",

    // Index Rules
    rules_tag: "RULES & GUIDELINES",
    rules_heading: "커뮤니티 가이드라인",
    rule_1_title: "공정한 플레이 준수",
    rule_1_desc: "핵, 불법 클라이언트, 매크로 등 부정한 도구의 사용은 엄격히 금지됩니다.",
    rule_2_title: "비방 및 악의적 행동 금지",
    rule_2_desc: "모든 플레이어를 존중해 주시고 욕설, 혐오 표현, 분란 조장 행위를 하지 마세요.",
    rule_3_title: "언어별 채널 규칙 준수",
    rule_3_desc: "지정된 채널 언어에 맞춰 대화하고 번역기를 활용하여 친절하게 교류합시다.",

    // Auth Page
    auth_badge: "SECURE VERIFICATION",
    auth_title: "ArchMC 플레이어 인증",
    auth_desc: "마인크래프트 닉네임과 디스코드 ID를 연동하여 전용 역할을 획득하세요. 언제든지 연동을 해제할 수 있습니다.",

    tab_verify: "인증하기",
    tab_unlink: "인증 해제하기",

    form_avatar_title: "스킨 미리보기",
    form_avatar_hint: "MCID를 입력하면 플레이어 스킨이 표시됩니다",

    label_mcid: "ArchMC 마인크래프트 닉네임 (MCID)",
    placeholder_mcid: "예: Steve",
    hint_mcid: "대소문자를 정확히 입력해 주세요",

    label_discord_id: "디스코드 유저 ID",
    placeholder_discord_id: "예: 123456789012345678 (17~20자리 숫자)",
    hint_discord_id: "유저 닉네임이 아닌 17~20자리 숫자로 된 고유 ID를 입력하세요",
    link_discord_help: "디스코드 ID 찾는 방법",

    label_role_grant: "부여되는 디스코드 역할",
    role_name_badge: "Verified Player",
    role_id_note: "Role ID: 1568130111243554868",

    btn_submit_verify: "인증하고 역할 받기",
    btn_submitting_verify: "인증 요청 처리 중...",
    btn_submit_unlink: "연동 해제하기",
    btn_submitting_unlink: "해제 처리 중...",

    // Verified Status Card
    verified_status_badge: "인증 완료",
    verified_status_title: "현재 인증되어 있습니다",
    verified_status_desc: "이 기기는 현재 아래 정보로 연동되어 있습니다. 언제든 연동을 해제할 수 있습니다.",
    info_mcid_label: "등록된 MCID",
    info_discord_label: "등록된 디스코드 ID",
    info_role_label: "부여된 역할",
    info_date_label: "인증 일시",
    btn_show_unlink: "이 연동 해제하기",

    // Unlink Manual Tab
    unlink_title: "수동 연동 해제",
    unlink_desc: "등록한 마인크래프트 ID와 디스코드 ID를 입력하여 연동을 해제합니다. 부여된 역할은 회수됩니다.",

    // Discord ID Help Modal
    modal_help_title: "디스코드 유저 ID 확인 방법",
    modal_step_1: "디스코드 왼쪽 하단 '사용자 설정(⚙️ 톱니바퀴)'을 클릭합니다.",
    modal_step_2: "'고급' 탭을 선택하고 '개발자 모드'를 활성화합니다.",
    modal_step_3: "자신의 프로필을 우클릭(모바일은 길게 터치) 후 '사용자 ID 복사'를 누릅니다.",
    modal_help_note: "※ 계정 닉네임이 아닌 17~20자리의 숫자 ID여야 합니다.",
    btn_modal_close: "확인했습니다",

    // Alerts / Toasts
    alert_empty_fields: "모든 항목을 올바르게 입력해 주세요.",
    alert_invalid_discord: "디스코드 ID는 17~20자리 숫자로 입력해야 합니다.",
    alert_verify_success: "🎉 인증 완료! 디스코드 역할(1568130111243554868)이 부여됩니다.",
    alert_unlink_confirm: "本当に認証を解除しますか？付与されているDiscordロールは解除されます。",
    alert_unlink_success: "✅ 인증이 해제되었습니다. 디스코드 연동이 취소되었습니다.",
    alert_network_error: "웹훅 요청에 실패했습니다. 잠시 후 다시 시도해 주세요.",

    // Footer
    footer_text: "ArchMC JP/EN Community. 비공식 팬 커뮤니티 사이트입니다. Mojang Studios 또는 Microsoft와 제휴 관계가 아닙니다.",
    footer_quick_links: "빠른 링크",
    footer_community: "커뮤니티"
  }
};

class I18nManager {
  constructor() {
    this.currentLang = this.getSavedLanguage() || 'ja';
    this.languages = [
      { code: 'ja', name: '日本語', flag: '🇯🇵' },
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'zh', name: '简体中文', flag: '🇨🇳' },
      { code: 'ko', name: '한국어', flag: '🇰🇷' }
    ];
  }

  getSavedLanguage() {
    try {
      const saved = localStorage.getItem('archmc_lang');
      if (saved && I18N_DATA[saved]) return saved;
      
      const navLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
      if (navLang.startsWith('ja')) return 'ja';
      if (navLang.startsWith('zh')) return 'zh';
      if (navLang.startsWith('ko')) return 'ko';
      if (navLang.startsWith('en')) return 'en';
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
    return 'ja';
  }

  setLanguage(langCode) {
    if (!I18N_DATA[langCode]) return;
    this.currentLang = langCode;
    try {
      localStorage.setItem('archmc_lang', langCode);
    } catch (e) {
      console.warn(e);
    }
    document.documentElement.lang = langCode;
    this.applyTranslations();
    this.updateLanguageDropdown();
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: langCode } }));
  }

  getText(key) {
    const langDict = I18N_DATA[this.currentLang] || I18N_DATA.ja;
    return langDict[key] || I18N_DATA.ja[key] || key;
  }

  applyTranslations() {
    // Replace text of elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const text = this.getText(key);
      if (text) {
        el.textContent = text;
      }
    });

    // Replace placeholder of elements with data-i18n-placeholder attribute
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const text = this.getText(key);
      if (text) {
        el.setAttribute('placeholder', text);
      }
    });

    // Replace title of elements with data-i18n-title attribute
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      const text = this.getText(key);
      if (text) {
        el.setAttribute('title', text);
      }
    });
  }

  updateLanguageDropdown() {
    const curBtn = document.getElementById('currentLangBtn');
    if (!curBtn) return;
    const curObj = this.languages.find(l => l.code === this.currentLang) || this.languages[0];
    curBtn.innerHTML = `<span class="flag-icon">${curObj.flag}</span> <span class="lang-text">${curObj.name}</span> <span class="dropdown-arrow">▾</span>`;
    
    document.querySelectorAll('.lang-option').forEach(opt => {
      const code = opt.getAttribute('data-lang');
      if (code === this.currentLang) {
        opt.classList.add('active');
      } else {
        opt.classList.remove('active');
      }
    });
  }

  init() {
    this.applyTranslations();
    this.updateLanguageDropdown();
  }
}

const i18n = new I18nManager();
window.i18n = i18n;
