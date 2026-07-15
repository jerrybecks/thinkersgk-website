#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CHECK_ONLY = process.argv.includes('--check');
const EXCLUDED_DIRS = new Set(['.git', '.wrangler', 'drafts', 'graphify-out', 'node_modules', 'raw']);
const LOGO_FILE = 'assets/logo-thinkers-new-transparent.png?v=20260531c';

function listHtmlFiles(directory) {
    const files = [];
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        if (entry.name.startsWith('.') && entry.name !== '.well-known') continue;
        if (entry.isDirectory() && EXCLUDED_DIRS.has(entry.name)) continue;
        const absolute = path.join(directory, entry.name);
        if (entry.isDirectory()) files.push(...listHtmlFiles(absolute));
        else if (entry.isFile() && entry.name.endsWith('.html')) files.push(absolute);
    }
    return files;
}

function rootPrefix(file) {
    const relative = path.relative(path.dirname(file), ROOT).split(path.sep).join('/');
    return relative ? relative + '/' : '';
}

function isJapanesePage(file, html) {
    return /\.ja\.html$/i.test(file) || /<html\b[^>]*\blang=["']ja["']/i.test(html);
}

function localizedFile(base, japanese) {
    return base + (japanese ? '.ja' : '') + '.html';
}

function currentSection(file) {
    const rel = path.relative(ROOT, file).split(path.sep).join('/');
    const name = path.basename(file);
    if (rel.startsWith('blog/')) return 'insights';
    if (/^index(?:\.ja)?\.html$/i.test(name)) return 'home';
    if (/^(?:service-(?!itad)|services)(?:.*)?\.html$/i.test(name)) return 'services';
    if (/^(?:itad-japan|service-itad)(?:\.ja)?\.html$/i.test(name)) return 'itad';
    if (/^(?:why-us|about|case-studies)(?:\.ja)?\.html$/i.test(name)) return 'why';
    if (/^how-we-work(?:\.ja)?\.html$/i.test(name)) return 'process';
    if (/^(?:contact|get-started)(?:\.ja)?\.html$/i.test(name)) return 'contact';
    return '';
}

function bilingualText(en, ja, japanese) {
    return japanese ? ja : en;
}

function navigationMarkup(file, html) {
    const prefix = rootPrefix(file);
    const japanese = isJapanesePage(file, html);
    const current = currentSection(file);
    const items = [
        ['home', localizedFile('index', japanese), 'Home', 'ホーム'],
        ['services', localizedFile('services', japanese), 'Services', 'サービス'],
        ['itad', 'itad-japan.html', 'ITAD Japan', 'ITAD 日本'],
        ['why', localizedFile('why-us', japanese), 'Why Thinkers GK', '選ばれる理由'],
        ['process', localizedFile('how-we-work', japanese), 'How We Work', '進め方'],
        ['insights', 'blog/index.html', 'Insights', 'インサイト'],
        ['contact', localizedFile('contact', japanese), 'Contact Us', 'お問い合わせ'],
    ];

    return '<div class="nav-menu" id="navMenu">\n' + items.map(([key, href, en, ja]) => {
        const classes = key === 'contact' ? ' class="btn btn-sm nav-cta"' : '';
        const active = key === current ? ' aria-current="page"' : '';
        return `  <a href="${prefix + href}" data-nav-key="${key}" data-en="${en}" data-ja="${ja}"${classes}${active}>${bilingualText(en, ja, japanese)}</a>`;
    }).join('\n') + '\n</div>';
}

function headerBrandMarkup(file, html) {
    const prefix = rootPrefix(file);
    const japanese = isJapanesePage(file, html);
    return `<a href="${prefix + localizedFile('index', japanese)}" class="nav-brand"><img src="${prefix + LOGO_FILE}" alt="Thinkers GK" class="nav-logo nav-logo--new"></a>`;
}

function skipLinkMarkup(file, html) {
    const japanese = isJapanesePage(file, html);
    return `<a class="skip-link" href="#main-content" data-en="Skip to main content" data-ja="メインコンテンツへスキップ">${bilingualText('Skip to main content', 'メインコンテンツへスキップ', japanese)}</a>`;
}

function footerMarkup(file, html) {
    const prefix = rootPrefix(file);
    const japanese = isJapanesePage(file, html);
    const href = (value) => prefix + value;
    const local = (base) => href(localizedFile(base, japanese));
    const text = (en, ja) => bilingualText(en, ja, japanese);

    return `<footer class="footer" data-shared-layout="footer-v1">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="${local('index')}" class="nav-brand"><img src="${href(LOGO_FILE)}" alt="Thinkers GK" class="nav-logo nav-logo--new"></a>
        <p data-en="Bilingual IT services for local and international businesses across Japan." data-ja="日本国内企業と在日外資系企業向けのバイリンガルITサービス。">${text('Bilingual IT services for local and international businesses across Japan.', '日本国内企業と在日外資系企業向けのバイリンガルITサービス。')}</p>
      </div>
      <div class="footer-col">
        <h4 data-en="Company" data-ja="会社情報">${text('Company', '会社情報')}</h4>
        <a href="${local('about')}" data-en="About" data-ja="会社概要">${text('About', '会社概要')}</a>
        <a href="${local('services')}" data-en="Services" data-ja="サービス">${text('Services', 'サービス')}</a>
        <a href="${local('why-us')}" data-en="Why Thinkers GK" data-ja="選ばれる理由">${text('Why Thinkers GK', '選ばれる理由')}</a>
        <a href="${local('how-we-work')}" data-en="How We Work" data-ja="進め方">${text('How We Work', '進め方')}</a>
        <a href="${href('blog/index.html')}" data-en="Insights" data-ja="インサイト">${text('Insights', 'インサイト')}</a>
        <a href="${local('contact')}" data-en="Contact Us" data-ja="お問い合わせ">${text('Contact Us', 'お問い合わせ')}</a>
        <a href="${local('privacy-policy')}" data-en="Privacy Policy" data-ja="プライバシーポリシー">${text('Privacy Policy', 'プライバシーポリシー')}</a>
        <a href="${local('terms-of-service')}" data-en="Terms of Service" data-ja="利用規約">${text('Terms of Service', '利用規約')}</a>
      </div>
      <div class="footer-col">
        <h4 data-en="Services" data-ja="サービス">${text('Services', 'サービス')}</h4>
        <a href="${local('service-it-support')}" data-en="IT Support" data-ja="ITサポート">${text('IT Support', 'ITサポート')}</a>
        <a href="${local('service-field-engineering')}" data-en="Field Engineering" data-ja="フィールドエンジニアリング">${text('Field Engineering', 'フィールドエンジニアリング')}</a>
        <a href="${local('service-cybersecurity')}" data-en="Cybersecurity" data-ja="サイバーセキュリティ">${text('Cybersecurity', 'サイバーセキュリティ')}</a>
        <a href="${href('itad-japan.html')}" data-en="ITAD Japan" data-ja="ITAD 日本">${text('ITAD Japan', 'ITAD 日本')}</a>
        <a href="${local('service-device-lifecycle')}" data-en="Device Lifecycle" data-ja="デバイスライフサイクル">${text('Device Lifecycle', 'デバイスライフサイクル')}</a>
        <a href="${local('service-managed-services')}" data-en="Managed Services" data-ja="マネージドサービス">${text('Managed Services', 'マネージドサービス')}</a>
        <a href="${local('service-m365-saas')}" data-en="Microsoft 365 &amp; Intune" data-ja="Microsoft 365 / Intune">${text('Microsoft 365 &amp; Intune', 'Microsoft 365 / Intune')}</a>
      </div>
      <div class="footer-col">
        <h4 data-en="Contact" data-ja="連絡先">${text('Contact', '連絡先')}</h4>
        <a href="mailto:info@thinkersgk.com">info@thinkersgk.com</a>
        <a href="tel:+819063667901" data-en="+81 90-6366-7901" data-ja="090-6366-7901">${text('+81 90-6366-7901', '090-6366-7901')}</a>
        <a href="https://www.linkedin.com/company/thinkers-gk/" class="footer-social-link footer-social-link--linkedin" target="_blank" rel="noopener noreferrer" aria-label="Thinkers GK on LinkedIn"><svg class="footer-social-link__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.32 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14Zm1.78 13.02H3.54V9H7.1v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z"/></svg><span data-en="LinkedIn" data-ja="LinkedIn">LinkedIn</span></a>
        <a href="https://lin.ee/6Q3Z5jw" class="footer-social-link footer-social-link--line" target="_blank" rel="noopener noreferrer" aria-label="Thinkers GK on LINE"><span data-en="Add on LINE" data-ja="LINEで追加">${text('Add on LINE', 'LINEで追加')}</span></a>
        <span data-en="2F-C, Shibuya Dogenzaka Tokyu Bldg, 1-10-8 Dogenzaka, Shibuya-ku, Tokyo" data-ja="〒150-0043 東京都渋谷区道玄坂1-10-8 渋谷道玄坂東急ビル2F-C">${text('2F-C, Shibuya Dogenzaka Tokyu Bldg, 1-10-8 Dogenzaka, Shibuya-ku, Tokyo', '〒150-0043 東京都渋谷区道玄坂1-10-8 渋谷道玄坂東急ビル2F-C')}</span>
      </div>
    </div>
    <div class="footer-bottom"><p data-en="&copy; 2026 Thinkers GK (合同会社 Thinkers). All rights reserved." data-ja="&copy; 2026 Thinkers GK (合同会社 Thinkers). 全著作権所有。">${text('&copy; 2026 Thinkers GK (合同会社 Thinkers). All rights reserved.', '&copy; 2026 Thinkers GK (合同会社 Thinkers). 全著作権所有。')}</p></div>
  </div>
</footer>`;
}

function syncFile(file) {
    const relative = path.relative(ROOT, file).split(path.sep).join('/');
    if (relative === 'gerald/index.html') return { relative, skipped: true, reasons: ['intentional Gerald card exception'] };

    const original = fs.readFileSync(file, 'utf8');
    let updated = original;
    const reasons = [];

    const navPattern = /<nav\b[^>]*class=["'][^"']*\bnav\b[^"']*["'][^>]*id=["']nav["'][^>]*>[\s\S]*?<\/nav>/i;
    const navMatch = updated.match(navPattern);
    if (navMatch) {
        let nav = navMatch[0];
        const nextMenu = navigationMarkup(file, original);
        const menuPattern = /<div\b[^>]*class=["'][^"']*\bnav-menu\b[^"']*["'][^>]*id=["']navMenu["'][^>]*>[\s\S]*?<\/div>/i;
        if (!menuPattern.test(nav)) throw new Error(`${relative}: navigation exists but navMenu was not found`);
        nav = nav.replace(menuPattern, nextMenu);
        const brandPattern = /<a\b[^>]*class=["'][^"']*\bnav-brand\b[^"']*["'][^>]*>[\s\S]*?<\/a>/i;
        if (!brandPattern.test(nav)) throw new Error(`${relative}: navigation exists but nav-brand was not found`);
        nav = nav.replace(brandPattern, headerBrandMarkup(file, original));
        const togglePattern = /<button\b[^>]*class=["'][^"']*\bnav-toggle\b[^"']*["'][^>]*>/i;
        const japanese = isJapanesePage(file, original);
        const toggleLabel = japanese ? 'ナビゲーションメニューを開く' : 'Open navigation menu';
        const nextToggle = `<button class="nav-toggle" id="navToggle" type="button" aria-label="${toggleLabel}" aria-expanded="false" aria-controls="navMenu">`;
        if (!togglePattern.test(nav)) throw new Error(`${relative}: navigation exists but nav-toggle was not found`);
        nav = nav.replace(togglePattern, nextToggle);
        nav = nav.replace('<nav class="nav" id="nav">', '<nav class="nav" id="nav" data-shared-layout="header-v1">');
        if (nav !== navMatch[0]) {
            updated = updated.replace(navPattern, nav);
            reasons.push('header');
        }

        const skipPattern = /<a\b[^>]*class=["'][^"']*\bskip-link\b[^"']*["'][^>]*>[\s\S]*?<\/a>\s*/i;
        const nextSkipLink = skipLinkMarkup(file, original) + '\n';
        if (skipPattern.test(updated)) updated = updated.replace(skipPattern, nextSkipLink);
        else updated = updated.replace(/(<body\b[^>]*>)/i, `$1\n${nextSkipLink}`);

        if (!/\bid=["']main-content["']/i.test(updated)) {
            const contentStart = updated.search(/<(?:main|section)\b[^>]*>/i);
            if (contentStart === -1) throw new Error(`${relative}: navigation exists but no main content container was found`);
            const contentTag = updated.slice(contentStart).match(/^<(?:main|section)\b[^>]*>/i)[0];
            const enhancedTag = contentTag.replace(/>$/, ' id="main-content" tabindex="-1">');
            updated = updated.slice(0, contentStart) + updated.slice(contentStart).replace(contentTag, enhancedTag);
        }
        if (updated !== original && !reasons.includes('accessibility')) reasons.push('accessibility');
    }

    const footerPattern = /<footer\b[^>]*class=["'][^"']*\bfooter\b[^"']*["'][^>]*>[\s\S]*?<\/footer>/i;
    if (footerPattern.test(updated)) {
        const nextFooter = footerMarkup(file, original);
        if (updated.match(footerPattern)[0] !== nextFooter) {
            updated = updated.replace(footerPattern, nextFooter);
            reasons.push('footer');
        }
    }

    if (updated !== original && !CHECK_ONLY) fs.writeFileSync(file, updated, 'utf8');
    return { relative, changed: updated !== original, reasons };
}

const results = listHtmlFiles(ROOT).map(syncFile);
const changed = results.filter((result) => result.changed);
const skipped = results.filter((result) => result.skipped);

if (CHECK_ONLY && changed.length) {
    console.error(`Shared layout drift detected in ${changed.length} file(s):`);
    for (const result of changed) console.error(`- ${result.relative}: ${result.reasons.join(', ')}`);
    process.exit(1);
}

console.log(`${CHECK_ONLY ? 'Checked' : 'Synchronized'} shared layout: ${results.length - skipped.length} HTML files, ${changed.length} ${CHECK_ONLY ? 'drifted' : 'updated'}, ${skipped.length} intentional exception.`);
