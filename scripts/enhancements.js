/**
 * thinkersgk.com — UX enhancements
 * Zero dependencies. Three features:
 *   1. Scroll progress bar (thin accent line at viewport top)
 *   2. CSS spotlight on service cards (cursor-following glow via custom props)
 *   3. Subtle 3D tilt on cards (perspective transform on mousemove)
 */
(function () {
  function pathMatches(names) {
    var path = window.location.pathname || '';
    return names.some(function (name) {
      return path.indexOf(name) !== -1;
    });
  }

  // ── 1. Scroll progress bar ──────────────────────────────────────────────────
  function initScrollProgress() {
    var bar = document.createElement('div');
    bar.id = 'scroll-progress';
    document.body.appendChild(bar);

    var raf;
    window.addEventListener('scroll', function () {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = null;
        var scrolled = document.documentElement.scrollTop || document.body.scrollTop;
        var total = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = (total > 0 ? (scrolled / total) * 100 : 0) + '%';
      });
    }, { passive: true });
  }

  // ── 2. Card spotlight (cursor-following glow) ───────────────────────────────
  function initCardSpotlight() {
    var cards = document.querySelectorAll('.card, .service-feature-card, .illustration-card');
    cards.forEach(function (card) {
      card.classList.add('spotlight-card');
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
        card.style.setProperty('--my', (e.clientY - rect.top) + 'px');
      });
      card.addEventListener('mouseleave', function () {
        card.style.setProperty('--mx', '-999px');
        card.style.setProperty('--my', '-999px');
      });
    });
  }

  // ── 3. 3D card tilt ────────────────────────────────────────────────────────
  function initCardTilt() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(max-width: 768px)').matches) return;

    document.querySelectorAll('.card').forEach(function (card) {
      card.style.transformStyle = 'preserve-3d';
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var dx = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
        var dy = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
        card.style.transform = 'translateY(-6px) rotateX(' + (dy * -5) + 'deg) rotateY(' + (dx * 5) + 'deg)';
        card.style.transition = 'transform 0.08s ease';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
        card.style.transition = 'transform 0.45s cubic-bezier(0.22,1,0.36,1)';
      });
    });
  }

  // ── 4. Hero cursor spotlight ────────────────────────────────────────────────
  function initHeroCursorSpotlight() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(max-width: 768px)').matches) return;

    var hero = document.querySelector('.home-cinematic-hero');
    if (!hero) return;

    hero.style.setProperty('--hx', '-999px');
    hero.style.setProperty('--hy', '-999px');
    hero.classList.add('has-spotlight');

    var raf = null;
    hero.addEventListener('mousemove', function (e) {
      var rect = hero.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      if (raf) return;
      raf = requestAnimationFrame(function () {
        hero.style.setProperty('--hx', x + 'px');
        hero.style.setProperty('--hy', y + 'px');
        raf = null;
      });
    });
    hero.addEventListener('mouseleave', function () {
      hero.style.setProperty('--hx', '-999px');
      hero.style.setProperty('--hy', '-999px');
    });
  }

  // ── 5. Badge typer — cycles phrases on the hero badge ─────────────────────
  function initBadgeTyper() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var badge = document.querySelector('.home-cinematic-hero .hero-badge');
    if (!badge) return;

    var phrasesEn = [
      'Bilingual IT delivery for companies operating in Japan',
      'Field engineering across Tokyo and nationwide Japan',
      'Cybersecurity, ITAD & managed services in Japan',
      'One accountable IT partner for your Japan office'
    ];
    var phrasesJa = [
      '日本で事業を行う企業向けバイリンガルIT支援',
      '東京・全国でのフィールドエンジニアリング',
      'サイバーセキュリティ・ITAD・マネージドサービス',
      '日本拠点に特化した、信頼できるITパートナー'
    ];

    var idx = 0;
    var charIdx = 0;
    var deleting = false;
    var pauseCount = 0;
    var PAUSE_TYPE = 90;    /* ~2.9s at 32ms ticks */
    var PAUSE_DEL = 12;     /* ~0.4s */
    var TYPE_SPEED = 38;
    var DEL_SPEED = 16;

    function getLang() { return document.documentElement.getAttribute('lang') || 'en'; }

    function tick() {
      var list = getLang() === 'ja' ? phrasesJa : phrasesEn;
      var target = list[idx % list.length];

      if (pauseCount > 0) { pauseCount--; setTimeout(tick, 32); return; }

      if (!deleting) {
        charIdx = Math.min(charIdx + 1, target.length);
        badge.textContent = target.slice(0, charIdx);
        if (charIdx >= target.length) { deleting = true; pauseCount = PAUSE_TYPE; }
        setTimeout(tick, TYPE_SPEED);
      } else {
        charIdx = Math.max(charIdx - 1, 0);
        badge.textContent = target.slice(0, charIdx);
        if (charIdx <= 0) { deleting = false; idx++; pauseCount = PAUSE_DEL; }
        setTimeout(tick, DEL_SPEED);
      }
    }

    /* Let hero load first, then start cycling */
    charIdx = phrasesEn[0].length;
    badge.textContent = phrasesEn[0];
    setTimeout(function () { deleting = true; tick(); }, 3400);
  }

  // ── 6. Word scramble removed — caused visible glitch on every page load ───────
  function initWordScramble() { /* disabled */ }

  // ── 7. Hero parallax — grid + overlay shift on scroll ──────────────────────
  function initHeroParallax() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(max-width: 768px)').matches) return;

    var grid = document.querySelector('.home-cinematic-hero__grid');
    var overlay = document.querySelector('.home-cinematic-hero__overlay');
    if (!grid) return;

    var raf = null;
    window.addEventListener('scroll', function () {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        var y = window.scrollY;
        grid.style.transform = 'translateY(' + (y * 0.22) + 'px)';
        if (overlay) overlay.style.transform = 'translateY(' + (y * 0.1) + 'px)';
        raf = null;
      });
    }, { passive: true });
  }

  // ── 4. Curated service hero media ──────────────────────────────────────────
  function initServiceHeroMedia() {
    var mediaMap = {
      'service-it-support.html': {
        image: 'assets/hero-it-support-1400x600.jpg',
        altEn: 'Bilingual IT support team in action',
        altJa: '対応中のバイリンガルITサポートチーム',
        eyebrowEn: 'User support',
        eyebrowJa: '利用者支援',
        titleEn: 'Clear support coverage for users, devices, and site issues in Japan.',
        titleJa: '日本でのユーザー、端末、現場課題に明確な支援体制を。',
        bodyEn: 'Remote troubleshooting, onsite follow-through, and bilingual coordination designed for day-to-day operational continuity.',
        bodyJa: '日々の運用を止めにくくするための、リモート対応、現地フォロー、日英での調整をまとめています。'
      },
      'service-managed-services.html': {
        image: 'assets/hero-managed-services-1400x600.jpg',
        altEn: 'Managed services planning session',
        altJa: 'マネージドサービスの計画ミーティング',
        eyebrowEn: 'Managed operations',
        eyebrowJa: '運用支援',
        titleEn: 'Reporting, coordination, and continuity in one operating lane.',
        titleJa: '報告、調整、継続対応をひとつの運用レーンに。',
        bodyEn: 'A steadier delivery model for teams that need support, vendor management, and operational visibility to move together.',
        bodyJa: 'サポート、ベンダー調整、運用の見える化を一体で進めたいチーム向けの体制です。'
      },
      'service-cybersecurity.html': {
        image: 'assets/hero-cybersecurity-1400x600.jpg',
        altEn: 'Cybersecurity monitoring and secure infrastructure',
        altJa: 'サイバーセキュリティ監視と安全なインフラ',
        eyebrowEn: 'Security posture',
        eyebrowJa: 'セキュリティ態勢',
        titleEn: 'Visibility, hardening, and response planning for real operating environments.',
        titleJa: '実運用に合わせた見える化、強化、対応計画。',
        bodyEn: 'A practical security layer for teams that need clearer priorities, stronger controls, and faster coordination when risk rises.',
        bodyJa: '優先順位を明確にし、統制を強め、リスク上昇時の対応を早めたいチーム向けの実務的なセキュリティ支援です。'
      },
      'service-field-engineering.html': {
        image: 'assets/hero-field-engineering-1400x600.jpg',
        altEn: 'Field engineer working on-site',
        altJa: '現地作業を行うフィールドエンジニア',
        eyebrowEn: 'On-site execution',
        eyebrowJa: '現地実行',
        titleEn: 'Nationwide hands-on coverage for installs, swaps, and site work.',
        titleJa: '設置、交換、現地作業を全国で実行。',
        bodyEn: 'A practical field delivery layer for offices, warehouses, project sites, and regional rollouts across Japan.',
        bodyJa: 'オフィス、倉庫、現場、全国展開に対応する実務的なフィールド対応です。'
      },
      'service-cloud-consulting.html': {
        image: 'assets/hero-cloud-consulting-1400x600.jpg',
        altEn: 'Data center with servers for cloud consulting',
        altJa: 'クラウドコンサルティング向けのサーバールーム',
        eyebrowEn: 'Cloud strategy',
        eyebrowJa: 'クラウド戦略',
        titleEn: 'Cloud planning with clearer priorities, architecture, and delivery tradeoffs.',
        titleJa: '優先順位、設計、進め方を明確にするクラウド計画。',
        bodyEn: 'For teams balancing migration, platform choice, security posture, and cost without turning the roadmap into guesswork.',
        bodyJa: '移行、プラットフォーム選定、セキュリティ、コストのバランスを取りながら、曖昧さを減らして進めたいチーム向けです。'
      },
      'service-asset-lifecycle.html': {
        image: 'assets/hero-asset-lifecycle-1400x600.jpg',
        altEn: 'IT asset management and equipment lifecycle tracking',
        altJa: 'IT資産管理と機器ライフサイクルの追跡',
        eyebrowEn: 'Asset lifecycle',
        eyebrowJa: '資産ライフサイクル',
        titleEn: 'Collection, handling, refresh, and retirement mapped to real operations.',
        titleJa: '回収、取扱い、更新、廃棄までを実運用に合わせて整理。',
        bodyEn: 'A structured lane for equipment transitions, documentation, logistics, and responsible end-of-life handling across Japan.',
        bodyJa: '日本国内での機器更新、記録、物流、適切な終端処理までを整理して進めるための運用レーンです。'
      },
      'service-networking.html': {
        image: 'assets/hero-networking-1400x600.jpg',
        altEn: 'Network cables and switching infrastructure',
        altJa: 'ネットワークケーブルとスイッチングインフラ',
        eyebrowEn: 'Network delivery',
        eyebrowJa: 'ネットワーク運用',
        titleEn: 'Connectivity design and remediation for offices, sites, and multi-location teams.',
        titleJa: 'オフィス、現場、複数拠点に向けた接続設計と改善。',
        bodyEn: 'Switching, cabling, wireless, and troubleshooting support shaped around uptime, rollout speed, and field realities.',
        bodyJa: 'スイッチ、配線、無線、障害対応を、稼働率と展開スピード、現場事情に合わせて組み立てます。'
      },
      'service-onsite-dispatch.html': {
        image: 'assets/hero-onsite-dispatch-1400x600.jpg',
        altEn: 'Onsite dispatch technician working on cabling and rack equipment',
        altJa: '配線とラック機器に対応するオンサイト技術者',
        eyebrowEn: 'Dispatch response',
        eyebrowJa: '現地対応',
        titleEn: 'Fast onsite response for break-fix work, installs, and urgent site issues.',
        titleJa: '障害対応、設置、緊急の現場課題に素早く対応。',
        bodyEn: 'A dispatch layer built for offices and distributed sites that need practical action, clear ETAs, and service reporting.',
        bodyJa: 'オフィスや分散拠点で、実行力、到着見込み、作業報告を重視するための現地対応です。'
      },
      'service-ai-integration.html': {
        image: 'assets/hero-ai-integration-1400x600.jpg',
        altEn: 'AI technology visualization and neural network',
        altJa: 'AI技術のビジュアライゼーションとニューラルネットワーク',
        eyebrowEn: 'AI delivery',
        eyebrowJa: 'AI導入',
        titleEn: 'AI projects connected to workflow reality, governance, and daily operations.',
        titleJa: '業務、統制、日々の運用につながるAI導入。',
        bodyEn: 'A practical path for teams that want pilots, integrations, and operating rules without turning AI into slideware.',
        bodyJa: 'PoC、実装、運用ルールまでを整理し、AIを机上の話で終わらせないための進め方です。'
      },
      'service-dx-consulting.html': {
        image: 'assets/hero-dx-consulting-1400x600.jpg',
        altEn: 'Digital transformation strategy meeting',
        altJa: 'デジタル変革の戦略会議',
        eyebrowEn: 'Transformation planning',
        eyebrowJa: '変革設計',
        titleEn: 'DX planning tied to ownership, sequencing, and real operating constraints.',
        titleJa: '責任分担、順序、現実の制約に結びついたDX計画。',
        bodyEn: 'For organizations that need modernization translated into concrete workstreams instead of broad transformation language.',
        bodyJa: '抽象的な変革論ではなく、実際の作業レーンに落とし込んで進めたい組織向けです。'
      },
      'service-zero-trust.html': {
        image: 'assets/hero-zero-trust-1400x600.jpg',
        altEn: 'Security lock and zero trust protection concept',
        altJa: 'セキュリティロックとゼロトラスト保護のコンセプト',
        eyebrowEn: 'Access hardening',
        eyebrowJa: 'アクセス強化',
        titleEn: 'Zero Trust rollout with practical sequencing for identity, devices, and access.',
        titleJa: 'ID、端末、アクセスを段階的に整えるZero Trust導入。',
        bodyEn: 'A grounded security program for teams reducing broad access without disrupting day-to-day operations all at once.',
        bodyJa: '日々の運用を一度に壊さず、広すぎる権限を減らしていくための現実的なセキュリティ設計です。'
      },
      'service-staff-augmentation.html': {
        image: 'assets/hero-staff-augmentation-1400x600.jpg',
        altEn: 'Diverse team collaborating in modern office',
        altJa: '現代オフィスで協力する多様なチーム',
        eyebrowEn: 'Delivery capacity',
        eyebrowJa: '体制強化',
        titleEn: 'Extra hands for support, rollout, and coordination without losing control.',
        titleJa: '統制を失わずに、支援・展開・調整の体制を補強。',
        bodyEn: 'Built for teams that need temporary capacity in Japan while keeping ownership, visibility, and service standards intact.',
        bodyJa: '日本で一時的な増員が必要でも、責任範囲や見える化、品質基準を崩したくないチーム向けです。'
      },
      'service-cloud-migration.html': {
        image: 'assets/hero-cloud-migration-1400x600.jpg',
        altEn: 'Cloud computing infrastructure and migration',
        altJa: 'クラウドコンピューティングインフラと移行',
        eyebrowEn: 'Migration execution',
        eyebrowJa: '移行実行',
        titleEn: 'Migration sequencing, cutover discipline, and post-move readiness in one plan.',
        titleJa: '移行順序、切替、移行後の運用準備をひとつの計画に。',
        bodyEn: 'A steadier path for teams moving workloads to the cloud while managing risk, timing, and operational continuity.',
        bodyJa: 'リスク、時期、運用継続を見ながらクラウド移行を進めたいチーム向けの、より安定した進め方です。'
      },
      'service-project-management.html': {
        image: 'assets/hero-project-management-1400x600.jpg',
        altEn: 'Team collaborating on project planning and delivery',
        altJa: 'プロジェクト計画と進行を協議するチーム',
        eyebrowEn: 'Project delivery',
        eyebrowJa: '案件推進',
        titleEn: 'IT projects kept moving through clearer planning, ownership, and coordination.',
        titleJa: '計画、責任分担、調整を明確にしてIT案件を前進。',
        bodyEn: 'For rollouts and technology projects that need more structure, steadier communication, and fewer handoff gaps.',
        bodyJa: '展開案件や技術プロジェクトを、より整理された進め方と確かな連携で進めたいチーム向けです。'
      },
      'service-office-relocation.html': {
        image: 'assets/hero-office-relocation-1400x600.jpg',
        altEn: 'Office relocation and IT setup in progress',
        altJa: 'オフィス移転とIT設営の作業中',
        eyebrowEn: 'Relocation support',
        eyebrowJa: '移転支援',
        titleEn: 'Office moves coordinated with infrastructure, users, and reopening timelines in mind.',
        titleJa: 'インフラ、利用者、再開日程を見据えたオフィス移転対応。',
        bodyEn: 'A practical delivery lane for moves that need disconnects, reinstallations, handover control, and day-one readiness.',
        bodyJa: '撤去、再設置、引き継ぎ、初日稼働までを現実的に整えるための移転支援です。'
      },
      'service-wireless-survey.html': {
        image: 'assets/hero-wireless-survey-1400x600.jpg',
        altEn: 'Wi-Fi survey tools and wireless network planning',
        altJa: 'Wi-Fi調査ツールと無線ネットワーク設計',
        eyebrowEn: 'Wireless survey',
        eyebrowJa: '無線調査',
        titleEn: 'Coverage planning that turns floor layouts into workable wireless decisions.',
        titleJa: 'フロア図を実用的な無線設計につなげる調査。',
        bodyEn: 'Built for offices and facilities that need better Wi-Fi coverage, cleaner survey evidence, and more dependable rollout planning.',
        bodyJa: 'Wi-Fiの届き方、調査結果、展開計画をより確かにしたいオフィスや施設向けです。'
      },
      'service-av-solutions.html': {
        image: 'assets/hero-av-solutions-1400x600.jpg',
        altEn: 'Conference room with AV equipment and displays',
        altJa: 'AV機器とディスプレイのある会議室',
        eyebrowEn: 'AV delivery',
        eyebrowJa: 'AV構築',
        titleEn: 'Meeting rooms and presentation spaces set up for clearer daily use.',
        titleJa: '会議室や発表空間を日常運用しやすく整備。',
        bodyEn: 'From room planning to installation follow-through, for teams that want AV to work reliably without constant improvisation.',
        bodyJa: '会議室計画から設置後の安定運用まで、場当たり対応を減らしたいチーム向けのAV支援です。'
      },
      'service-voip.html': {
        image: 'assets/hero-voip-1400x600.jpg',
        altEn: 'Modern VoIP phone system and business communication',
        altJa: '最新VoIP電話システムとビジネスコミュニケーション',
        eyebrowEn: 'Business communications',
        eyebrowJa: '業務通話',
        titleEn: 'VoIP rollout planned around users, routing, and business continuity.',
        titleJa: '利用者、経路、継続運用を考えたVoIP導入。',
        bodyEn: 'A steadier communications setup for organizations moving between legacy telephony, cloud calling, and hybrid office needs.',
        bodyJa: '従来電話からクラウド通話まで、現実の業務に合わせて切り替えたい組織向けの通信支援です。'
      },
      'service-data-backup.html': {
        image: 'assets/hero-data-backup-1400x600.jpg',
        altEn: 'Data center server room for backup and recovery',
        altJa: 'バックアップと復旧のためのデータセンター',
        eyebrowEn: 'Backup readiness',
        eyebrowJa: 'バックアップ体制',
        titleEn: 'Backup and recovery designed for actual risk, recovery windows, and operational proof.',
        titleJa: '実際のリスク、復旧時間、証跡を見据えたバックアップ設計。',
        bodyEn: 'For teams that need stronger recovery planning, clearer retention rules, and more confidence in what can actually be restored.',
        bodyJa: '復旧計画、保存方針、実際に戻せるかどうかの確度を高めたいチーム向けです。'
      },
      'service-cybersecurity-training.html': {
        image: 'assets/hero-cybersecurity-training-1400x600.jpg',
        altEn: 'Cybersecurity awareness training workshop',
        altJa: 'サイバーセキュリティ意識向上トレーニング',
        eyebrowEn: 'Security training',
        eyebrowJa: '教育対応',
        titleEn: 'Security awareness training connected to real user behavior and business risk.',
        titleJa: '実際の利用者行動と業務リスクにつながるセキュリティ教育。',
        bodyEn: 'A practical training layer for teams that need clearer phishing readiness, response habits, and operational reinforcement.',
        bodyJa: 'フィッシング耐性、初動、現場での定着を強めたいチーム向けの実務的な教育支援です。'
      },
      'service-hardware-maintenance.html': {
        image: 'assets/hero-hardware-maintenance-1400x600.jpg',
        altEn: 'Circuit board and hardware components maintenance',
        altJa: '回路基板とハードウェアコンポーネントの保守',
        eyebrowEn: 'Hardware care',
        eyebrowJa: '保守対応',
        titleEn: 'Hardware upkeep built around uptime, swaps, lifecycle, and site realities.',
        titleJa: '稼働率、交換、ライフサイクル、現場事情を踏まえたハード保守。',
        bodyEn: 'For organizations that need steadier preventive care, break-fix support, and clearer handling of aging equipment across Japan.',
        bodyJa: '予防保守、障害対応、老朽化機器の扱いをより安定して進めたい組織向けです。'
      },
      'service-service-desk.html': {
        image: 'assets/hero-service-desk-1400x600.jpg',
        altEn: 'Service desk team managing user support tickets',
        altJa: 'ユーザーサポートチケットを管理するサービスデスクチーム',
        eyebrowEn: 'Service desk',
        eyebrowJa: '窓口対応',
        titleEn: 'User requests, tickets, and follow-through managed through one support lane.',
        titleJa: '利用者対応、チケット、フォローをひとつの支援レーンで管理。',
        bodyEn: 'A practical desk function for teams that need better intake, clearer escalation, and more dependable day-to-day user support.',
        bodyJa: '受付、エスカレーション、日常支援をより安定して回したいチーム向けの窓口機能です。'
      },
      'service-access-control.html': {
        image: 'assets/hero-access-control-1400x600.jpg',
        altEn: 'Secure access control and keycard entry system',
        altJa: 'セキュアなアクセス制御とカードキー入退室システム',
        eyebrowEn: 'Access control',
        eyebrowJa: '入退管理',
        titleEn: 'Physical access controls coordinated with security policy and site operations.',
        titleJa: 'セキュリティ方針と現場運用をそろえる入退室管理。',
        bodyEn: 'For organizations that need badge, entry, and visitor control to work cleanly alongside broader IT and security operations.',
        bodyJa: 'バッジ、入退室、来訪者管理をIT・セキュリティ運用と無理なく合わせたい組織向けです。'
      },
      'service-ai-solutions.html': {
        image: 'assets/hero-ai-solutions-1400x600.jpg',
        altEn: 'AI dashboard and machine learning visualization',
        altJa: 'AIダッシュボードと機械学習のビジュアライゼーション',
        eyebrowEn: 'AI solutions',
        eyebrowJa: 'AI活用',
        titleEn: 'AI solutions scoped around business workflows, controls, and useful outcomes.',
        titleJa: '業務、統制、成果に結びつけるAIソリューション設計。',
        bodyEn: 'A grounded path for teams that want AI shaped into service operations, internal workflows, and measurable practical value.',
        bodyJa: 'AIをサービス運用や社内業務に組み込み、実際の価値につなげたいチーム向けの進め方です。'
      },
      'service-daas-vdi.html': {
        image: 'assets/hero-daas-vdi-1400x600.jpg',
        altEn: 'Virtual desktop infrastructure and DaaS workspace',
        altJa: '仮想デスクトップとDaaSワークスペース環境',
        eyebrowEn: 'DaaS & VDI',
        eyebrowJa: 'DaaS＆VDI',
        titleEn: 'Virtual desktops and DaaS platforms built for secure, flexible work across Japan.',
        titleJa: '日本全国で安全かつ柔軟な働き方を支える仮想デスクトップ＆DaaS。',
        bodyEn: 'Citrix, AVD, and thin-client rollouts designed for hybrid teams, compliance requirements, and centralized IT control.',
        bodyJa: 'Citrix・AVD・シンクライアント展開で、ハイブリッドワーク、コンプライアンス、IT一元管理を実現。'
      },
      'service-cloud-printing.html': {
        image: 'assets/hero-cloud-printing-1400x600.jpg',
        altEn: 'Cloud printing and MFP management setup',
        altJa: 'クラウドプリントとMFP管理の構築',
        eyebrowEn: 'Cloud printing',
        eyebrowJa: 'クラウド印刷',
        titleEn: 'Cloud print management and MFP integration for modern offices across Japan.',
        titleJa: '日本のモダンオフィス向けクラウド印刷管理＆MFP統合。',
        bodyEn: 'SMTP relay, pull-print, driver deployment, and hybrid print infrastructure that works with your existing fleet.',
        bodyJa: 'SMTPリレー、プルプリント、ドライバ展開、既存機器と連携するハイブリッド印刷基盤。'
      }
    };
    var pathname = window.location.pathname || '';
    var slug = Object.keys(mediaMap).find(function (key) {
      return pathname.indexOf(key) !== -1;
    });
    if (!slug) return;

    var hero = document.querySelector('.service-page-hero');
    var container = hero && hero.querySelector('.container');
    var content = container && container.querySelector('.service-hero-content');
    if (!hero || !container || !content) return;
    if (container.querySelector('.service-hero-media')) return;

    var config = mediaMap[slug];
    hero.classList.add('service-page-hero--with-media');
    container.classList.add('service-page-hero__layout');

    var panel = document.createElement('aside');
    panel.className = 'service-hero-media reveal-up';
    panel.innerHTML =
      '<div class="service-hero-media__frame">' +
        '<div class="service-hero-media__visual">' +
          '<img src="' + config.image + '" alt="' + config.altEn + '" data-en-alt="' + config.altEn + '" data-ja-alt="' + config.altJa + '" loading="eager">' +
          '<div class="service-hero-media__overlay"></div>' +
        '</div>' +
        '<div class="service-hero-media__card">' +
          '<span class="service-hero-media__eyebrow" data-en="' + config.eyebrowEn + '" data-ja="' + config.eyebrowJa + '">' + config.eyebrowEn + '</span>' +
          '<h3 data-en="' + config.titleEn + '" data-ja="' + config.titleJa + '">' + config.titleEn + '</h3>' +
          '<p data-en="' + config.bodyEn + '" data-ja="' + config.bodyJa + '">' + config.bodyEn + '</p>' +
        '</div>' +
      '</div>';

    container.appendChild(panel);
  }

  function initServiceLaunchHeroMedia() {
    var mediaMap = {
      'service-ai-integration.html': {
        type: 'video',
        src: 'assets/videos/ai-technology-bg.mp4',
        poster: 'assets/hero-ai-integration-1400x600.jpg',
        altEn: 'AI workflow and data intelligence visualization',
        altJa: 'AIワークフローとデータ活用のビジュアライゼーション',
        labelEn: 'AI workflow design',
        labelJa: 'AI活用設計'
      },
      'service-cloud-migration.html': {
        type: 'video',
        src: 'assets/videos/cloud-services-bg.mp4',
        poster: 'assets/hero-cloud-migration-1400x600.jpg',
        altEn: 'Cloud infrastructure and migration environment',
        altJa: 'クラウド基盤と移行環境',
        labelEn: 'Migration planning',
        labelJa: '移行計画'
      },
      'service-zero-trust.html': {
        type: 'video',
        src: 'assets/videos/cybersecurity-bg.mp4',
        poster: 'assets/hero-zero-trust-1400x600.jpg',
        altEn: 'Security controls and Zero Trust protection',
        altJa: 'セキュリティ統制とZero Trust保護',
        labelEn: 'Access hardening',
        labelJa: 'アクセス強化'
      },
      'service-dx-consulting.html': {
        type: 'image',
        src: 'assets/hero-dx-consulting-1400x600.jpg',
        altEn: 'Digital transformation planning session',
        altJa: 'デジタル変革の計画セッション',
        labelEn: 'Transformation roadmap',
        labelJa: '変革ロードマップ'
      },
      'service-staff-augmentation.html': {
        type: 'image',
        src: 'assets/hero-staff-augmentation-1400x600.jpg',
        altEn: 'Specialist team collaborating in a modern office',
        altJa: '現代オフィスで協働する専門チーム',
        labelEn: 'Delivery capacity',
        labelJa: '体制強化'
      },
      'service-m365-saas.html': {
        type: 'image',
        src: 'assets/hero-m365-saas-1400x600.jpg',
        altEn: 'Cloud workplace support team handling Microsoft 365 and SaaS operations',
        altJa: 'Microsoft 365とSaaS運用を支援するクラウドワークプレイスチーム',
        labelEn: 'Cloud workplace support',
        labelJa: 'クラウド運用支援'
      }
    };

    var pathname = window.location.pathname || '';
    var slug = Object.keys(mediaMap).find(function (key) {
      return pathname.indexOf(key) !== -1;
    });
    if (!slug) return;

    var panel = document.querySelector('.service-launch-hero__panel');
    if (!panel || panel.querySelector('.service-launch-hero__media')) return;

    var config = mediaMap[slug];
    var media = document.createElement('div');
    media.className = 'service-launch-hero__media';

    var mediaInner = '';
    if (config.type === 'video') {
      mediaInner =
        '<video class="service-launch-hero__media-video" autoplay muted loop playsinline preload="metadata" poster="' + config.poster + '" aria-label="' + config.altEn + '">' +
          '<source src="' + config.src + '" type="video/mp4">' +
        '</video>';
    } else {
      mediaInner =
        '<img src="' + config.src + '" alt="' + config.altEn + '" data-en-alt="' + config.altEn + '" data-ja-alt="' + config.altJa + '" loading="eager">';
    }

    media.innerHTML =
      '<div class="service-launch-hero__media-frame">' +
        mediaInner +
        '<div class="service-launch-hero__media-overlay"></div>' +
        '<div class="service-launch-hero__media-tag" data-en="' + config.labelEn + '" data-ja="' + config.labelJa + '">' + config.labelEn + '</div>' +
      '</div>';

    panel.insertBefore(media, panel.firstChild);
  }

  function buildBlogArtMap(assetPrefix) {
    return [
      { match: 'the-power-of-bilingual-it-support', image: assetPrefix + 'blog-bilingual-support-800x500.jpg', alt: 'Bilingual IT support bridging teams and communication in Japan' },
      { match: 'understanding-managed-services', image: assetPrefix + 'service-managed-services-800x500.jpg', alt: 'Managed services team coordinating day-to-day IT operations' },
      { match: 'green-it', image: assetPrefix + 'blog-green-it-800x500.jpg', alt: 'Sustainable green IT and eco-friendly data center' },
      { match: 'ai-backbone', image: assetPrefix + 'blog-ai-backbone-800x500.jpg', alt: 'AI-powered intelligent application architecture' },
      { match: 'cybersecurity-best-practices', image: assetPrefix + 'blog-cybersecurity-practices-800x500.jpg', alt: 'Cybersecurity best practices and monitoring' },
      { match: 'cybersecurity-for-small-businesses', image: assetPrefix + 'blog-cybersecurity-smb-800x500.jpg', alt: 'Cybersecurity protection for small businesses' },
      { match: 'ai-revolution', image: assetPrefix + 'blog-ai-revolution-800x500.jpg', alt: 'AI revolution transforming managed IT services' },
      { match: 'agentic-ai', image: assetPrefix + 'blog-agentic-ai-800x500.jpg', alt: 'Agentic AI workplace security and governance' },
      { match: 'zero-trust', image: assetPrefix + 'blog-zero-trust-800x500.jpg', alt: 'Zero trust security architecture concept' },
      { match: 'managed-services', image: assetPrefix + 'service-managed-services-800x500.jpg', alt: 'Managed services team coordinating operations' },
      { match: 'data-destruction', image: assetPrefix + 'blog-data-destruction-800x500.jpg', alt: 'Secure data destruction and sanitization' },
      { match: 'ai-maturity', image: assetPrefix + 'blog-ai-maturity-800x500.jpg', alt: 'AI maturity curve for Japanese businesses' },
      { match: 'evolving-cyber-threats', image: assetPrefix + 'blog-cyber-threats-800x500.jpg', alt: 'Evolving cyber threats monitoring dashboard' },
      { match: 'ai-practical-applications', image: assetPrefix + 'blog-ai-practical-800x500.jpg', alt: 'Practical AI applications in cloud integration' },
      { match: 'the-year-of-truth', image: assetPrefix + 'blog-ai-truth-800x500.jpg', alt: 'AI strategy decisions for Japanese SMBs' },
      { match: 'first-post', image: assetPrefix + 'hero-it-support-1400x600.jpg', alt: 'Tokyo IT support team delivering modern service operations' },
      { match: 'sample-post-1', image: assetPrefix + 'hero-networking-1400x600.jpg', alt: 'Technology infrastructure planning and deployment' },
      { match: 'sample-post-2', image: assetPrefix + 'hero-access-control-1400x600.jpg', alt: 'Security operations and access management' },
      { match: 'welcome-to-our-blog', image: assetPrefix + 'hero-field-engineering-1400x600.jpg', alt: 'Thinkers GK field engineering and onsite support' },
      { match: 'bilingual-it-support', image: assetPrefix + 'blog-bilingual-support-800x500.jpg', alt: 'Bilingual IT service desk support for Japan operations' },
      { match: 'cybersecurity-basics', image: assetPrefix + 'hero-cybersecurity-1400x600.jpg', alt: 'Cybersecurity fundamentals and incident readiness' }
    ];
  }

  // ── 5. Editorial blog card thumbnails ──────────────────────────────────────
  function initBlogCardMedia() {
    if (!pathMatches(['/blog/index.html', '/blog/'])) return;

    var artMap = buildBlogArtMap('../assets/');

    document.querySelectorAll('.blog-post-card').forEach(function (card) {
      if (card.querySelector('.blog-card-thumb')) return;
      var link = card.closest('a');
      var href = (link && link.getAttribute('href')) || '';
      var match = artMap.find(function (item) {
        return href.indexOf(item.match) !== -1;
      });
      if (!match) return;

      var thumb = document.createElement('div');
      thumb.className = 'blog-card-thumb';
      thumb.innerHTML =
        '<img src="' + match.image + '" alt="' + match.alt + '" loading="lazy">' +
        '<span class="blog-card-thumb__glow"></span>';
      card.insertBefore(thumb, card.firstChild);
      card.classList.add('blog-post-card--with-thumb');
    });
  }

  // ── 6. Editorial polish for blog article pages ────────────────────────────
  function slugify(text) {
    return String(text || '')
      .toLowerCase()
      .replace(/<[^>]+>/g, '')
      .replace(/[^a-z0-9\u3040-\u30ff\u3400-\u9fbf\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }

  function initBlogArticlePolish() {
    var path = window.location.pathname || '';
    if (path.indexOf('/blog/') === -1) return;

    var hero = document.querySelector('.blog-post-hero');
    var prose = document.querySelector('.prose');
    var header = document.querySelector('.page-header');
    if (!hero || !prose || !header) return;

    document.body.classList.add('blog-article-page');
    header.classList.add('page-header--article');

    var title = header.querySelector('h1');
    var byline = header.querySelector('.text-muted, p');
    var label = header.querySelector('.section-label');
    var heroImg = hero.querySelector('img');
    if (!title || !byline || !heroImg) return;

    var wordCount = prose.textContent.trim().split(/\s+/).filter(Boolean).length;
    var readMinutes = Math.max(3, Math.round(wordCount / 220));
    var contactHref = path.indexOf('/blog/posts/') !== -1 ? '../../contact.html' : '../contact.html';
    var artPrefix = path.indexOf('/blog/posts/') !== -1 ? '../../assets/' : '../assets/';
    var articleMap = buildBlogArtMap(artPrefix);
    var articleMatch = articleMap.find(function (item) {
      return path.indexOf(item.match) !== -1;
    });

    if (articleMatch) {
      heroImg.src = articleMatch.image;
      heroImg.alt = articleMatch.alt;
      heroImg.setAttribute('loading', 'eager');
    }

    var metaRow = document.createElement('div');
    metaRow.className = 'blog-article-meta';
    metaRow.innerHTML =
      '<span class="blog-article-meta__pill">' + (label ? label.textContent.trim() : 'Article') + '</span>' +
      '<span class="blog-article-meta__item">' + byline.textContent.trim() + '</span>' +
      '<span class="blog-article-meta__item">' + readMinutes + ' min read</span>';
    byline.insertAdjacentElement('afterend', metaRow);

    var intro = prose.querySelector('p');
    if (intro) intro.classList.add('blog-article-lead');

    var headings = Array.prototype.slice.call(prose.querySelectorAll('h2, h3'));
    var tocItems = [];
    headings.forEach(function (heading, index) {
      if (!heading.id) heading.id = slugify(heading.textContent) || ('section-' + index);
      if (heading.tagName === 'H2') {
        tocItems.push(
          '<a href="#' + heading.id + '" class="blog-article-toc__link">' +
            heading.textContent.trim() +
          '</a>'
        );
      }
    });

    var section = prose.closest('.section');
    var container = prose.parentElement;
    if (!section || !container) return;

    var shell = document.createElement('div');
    shell.className = 'blog-article-shell';

    var main = document.createElement('div');
    main.className = 'blog-article-main';

    var aside = document.createElement('aside');
    aside.className = 'blog-article-side';
    aside.innerHTML =
      '<div class="blog-article-side__card">' +
        '<span class="blog-article-side__eyebrow">Article Guide</span>' +
        '<h3>In this article</h3>' +
        '<div class="blog-article-toc">' + (tocItems.join('') || '<span class="blog-article-toc__empty">Short read</span>') + '</div>' +
      '</div>' +
      '<div class="blog-article-side__card blog-article-side__card--cta">' +
        '<span class="blog-article-side__eyebrow">Need help in Japan?</span>' +
        '<p>Talk to Thinkers GK about practical support, delivery, and technology operations.</p>' +
        '<a class="btn btn-primary btn-sm" href="' + contactHref + '">Contact Us</a>' +
      '</div>';

    container.insertBefore(shell, prose);
    shell.appendChild(main);
    shell.appendChild(aside);
    main.appendChild(prose);

    hero.classList.add('blog-post-hero--editorial');
    hero.innerHTML =
      '<div class="blog-post-hero__frame">' +
        hero.innerHTML +
        '<div class="blog-post-hero__overlay"></div>' +
        '<div class="blog-post-hero__content">' +
          '<span class="blog-post-hero__eyebrow">Editorial Brief</span>' +
          '<h2>' + title.textContent.trim() + '</h2>' +
          '<p>' + byline.textContent.trim() + '</p>' +
        '</div>' +
      '</div>';
  }

  // ── Boot ─────────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    initScrollProgress();
    initCardSpotlight();
    initCardTilt();
    initHeroCursorSpotlight();
    initBadgeTyper();
    initWordScramble();
    initHeroParallax();
    initServiceHeroMedia();
    initServiceLaunchHeroMedia();
    initBlogCardMedia();
    initBlogArticlePolish();
  });

})();
// Live ops panel — fetches real-time data from hub.thinkersgk.com and populates
// the existing .home-cinematic-hero__panel-body in the homepage hero.
//
// Append this function to scripts/enhancements.js, then call it once on DOMContentLoaded.
// The panel keeps its existing static markup as the fallback — we only swap content
// once we have good data, so a hub outage leaves the page looking exactly as it does today.

(function () {
  const HUB_BASE = 'https://hub.thinkersgk.com'; // Adjust if your public host differs
  const ENDPOINT = HUB_BASE + '/api/public/ops-snapshot';
  const REFRESH_MS = 90 * 1000;

  function formatNumber(n, suffix = '') {
    if (n === null || n === undefined) return null;
    const num = Number(n);
    if (!Number.isFinite(num)) return null;
    return num.toLocaleString('en-US') + suffix;
  }

  function formatRelative(iso) {
    if (!iso) return '';
    const t = Date.parse(iso);
    if (!Number.isFinite(t)) return '';
    const diff = Math.max(0, Date.now() - t);
    const min = Math.floor(diff / 60000);
    if (min < 1) return 'just now';
    if (min < 60) return `${min} min ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr} hr ago`;
    return `${Math.floor(hr / 24)} d ago`;
  }

  // Build the live panel body. Returns an HTMLElement that replaces the static body.
  function renderLivePanel(data, lang) {
    const isJa = lang === 'ja';
    const t = (en, ja) => (isJa ? ja : en);

    const wrap = document.createElement('div');
    wrap.className = 'home-cinematic-hero__panel-body home-cinematic-hero__panel-body--live';

    const rows = [
      data.ticketsResolvedToday !== null && data.ticketsResolvedToday !== undefined
        ? { label: t('Tickets resolved today', '本日対応済み'), value: formatNumber(data.ticketsResolvedToday) }
        : null,
      data.avgFirstResponseMin
        ? { label: t('Avg first response', '初動平均'), value: formatNumber(data.avgFirstResponseMin, ' min') }
        : null,
      data.endpointsMonitored
        ? { label: t('Endpoints monitored', '監視端末数'), value: formatNumber(data.endpointsMonitored) }
        : null,
      data.slaPercent !== null && data.slaPercent !== undefined
        ? { label: t('SLA achieved', 'SLA達成'), value: formatNumber(data.slaPercent, '%'), tone: 'good' }
        : null,
      data.openCriticalIncidents !== null && data.openCriticalIncidents !== undefined
        ? {
            label: t('Critical incidents', '重大障害'),
            value: data.openCriticalIncidents === 0
              ? t('0 open', '0 件')
              : formatNumber(data.openCriticalIncidents),
            tone: data.openCriticalIncidents === 0 ? 'good' : 'warn',
          }
        : null,
    ].filter(Boolean);

    if (!rows.length) return null;

    rows.forEach(row => {
      const item = document.createElement('div');
      item.className = 'home-cinematic-hero__metric home-cinematic-hero__metric--live';
      const label = document.createElement('span');
      label.textContent = row.label;
      const value = document.createElement('strong');
      value.textContent = row.value;
      if (row.tone === 'good') value.classList.add('is-good');
      if (row.tone === 'warn') value.classList.add('is-warn');
      item.appendChild(label);
      item.appendChild(value);
      wrap.appendChild(item);
    });

    // Footer with status indicator + last-updated stamp
    const footer = document.createElement('div');
    footer.className = 'home-cinematic-hero__panel-footer';
    footer.innerHTML = `
      <span class="home-cinematic-hero__live-dot" aria-hidden="true"></span>
      <span class="home-cinematic-hero__live-label">${t('Live', 'リアルタイム')}</span>
      <span class="home-cinematic-hero__live-stamp">${t('Updated', '更新')} ${formatRelative(data.updatedAt)}</span>
    `;
    wrap.appendChild(footer);

    return wrap;
  }

  async function fetchSnapshot(timeoutMs = 4000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const resp = await fetch(ENDPOINT, { signal: controller.signal, cache: 'no-store' });
      if (!resp.ok) throw new Error('bad-status:' + resp.status);
      const data = await resp.json();
      if (!data || data.degraded) throw new Error('degraded');
      return data;
    } finally {
      clearTimeout(timer);
    }
  }

  async function tick() {
    const panel = document.querySelector('.home-cinematic-hero__panel');
    const body = panel ? panel.querySelector('.home-cinematic-hero__panel-body') : null;
    if (!body) return; // Hero panel not on this page

    try {
      const data = await fetchSnapshot();
      const lang = (document.documentElement.lang || 'en').toLowerCase();
      const replacement = renderLivePanel(data, lang);
      if (!replacement) return; // No usable rows — leave static fallback in place
      // Mark the panel as live so CSS can style the indicator
      panel.classList.add('home-cinematic-hero__panel--live');
      // Swap only after we have a fully built replacement — never show "loading"
      body.parentNode.replaceChild(replacement, body);
    } catch (_) {
      // Silently leave the static markup as-is. The user sees no error state.
    }
  }

  function initLiveOpsPanel() {
    // Skip if no panel on this page
    if (!document.querySelector('.home-cinematic-hero__panel')) return;
    // First fetch — fire-and-forget
    tick();
    // Refresh on a slow cadence; pause when tab is hidden to be polite
    setInterval(() => {
      if (document.visibilityState === 'visible') tick();
    }, REFRESH_MS);
    // Re-render on language toggle (we read document.lang inside renderLivePanel)
    document.addEventListener('thinkers:lang-changed', tick);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLiveOpsPanel);
  } else {
    initLiveOpsPanel();
  }

  window.initLiveOpsPanel = initLiveOpsPanel;
})();
