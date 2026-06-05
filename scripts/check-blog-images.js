#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const postsDir = path.join(repoRoot, "blog", "posts");
const genericFallbacks = new Set([
  "assets/about-hero-1400x600.jpg",
  "assets/team-hero-1400x600.jpg",
  "assets/about-page-team-1200x500.jpg",
]);

function normalizeImage(value) {
  if (!value) return "";
  return value
    .replace(/^https?:\/\/www\.thinkersgk\.com\//, "")
    .replace(/^\.\.\/\.\.\//, "")
    .replace(/^\.\.\//, "")
    .replace(/^\.\//, "")
    .replace(/^\//, "");
}

function textContent(html, selectorRegex) {
  return (
    html.match(selectorRegex)?.[1] ||
    html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ||
    ""
  )
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function firstContentImage(html) {
  const heroBlock =
    html.match(
      /<div[^>]+class=["'][^"']*(?:blog-post-hero-img|blog-post-hero)[^"']*["'][\s\S]*?<\/div>/i,
    )?.[0] || "";
  const hero = heroBlock.match(/<img[^>]+src=["']([^"']+)/i)?.[1];
  if (hero) return normalizeImage(hero);

  const images = [...html.matchAll(/<img[^>]+src=["']([^"']+)/gi)]
    .map((match) => normalizeImage(match[1]))
    .filter(
      (image) =>
        image &&
        !image.includes("logo") &&
        !image.includes("favicon") &&
        !image.includes("testimonial"),
    );
  return images[0] || "";
}

function readPost(fileName) {
  const filePath = path.join(postsDir, fileName);
  const html = fs.readFileSync(filePath, "utf8");
  return {
    fileName,
    filePath,
    title: textContent(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i),
    hero: firstContentImage(html),
    og: normalizeImage(
      html.match(/<meta\s+property=["']og:image["'][^>]*content=["']([^"']+)/i)?.[1],
    ),
    twitter: normalizeImage(
      html.match(/<meta\s+name=["']twitter:image["'][^>]*content=["']([^"']+)/i)?.[1],
    ),
    jsonLd: normalizeImage(html.match(/"image"\s*:\s*"([^"]+)"/i)?.[1]),
  };
}

function main() {
  const posts = fs
    .readdirSync(postsDir)
    .filter((fileName) => fileName.endsWith(".html"))
    .sort()
    .map(readPost);

  const failures = [];
  const byHero = new Map();
  const postHeroByFile = new Map(posts.map((post) => [post.fileName, post.hero]));

  for (const post of posts) {
    if (!post.hero) {
      failures.push(`${post.fileName}: missing visible blog hero/content image`);
      continue;
    }

    if (genericFallbacks.has(post.hero)) {
      failures.push(`${post.fileName}: visible hero uses generic fallback ${post.hero}`);
    }

    if (!post.og || post.og !== post.hero) {
      failures.push(`${post.fileName}: og:image must match hero (${post.hero}), found ${post.og || "missing"}`);
    }

    if (!post.twitter || post.twitter !== post.hero) {
      failures.push(
        `${post.fileName}: twitter:image must match hero (${post.hero}), found ${post.twitter || "missing"}`,
      );
    }

    if (!post.jsonLd || post.jsonLd !== post.hero) {
      failures.push(
        `${post.fileName}: JSON-LD image must match hero (${post.hero}), found ${post.jsonLd || "missing"}`,
      );
    }

    const current = byHero.get(post.hero) || [];
    current.push(post.fileName);
    byHero.set(post.hero, current);
  }

  for (const [hero, fileNames] of byHero.entries()) {
    if (hero && fileNames.length > 1) {
      failures.push(`Duplicate blog hero ${hero}: ${fileNames.join(", ")}`);
    }
  }

  const indexPath = path.join(repoRoot, "blog", "index.html");
  if (fs.existsSync(indexPath)) {
    const indexHtml = fs.readFileSync(indexPath, "utf8");
    const cardImages = new Map();

    for (const match of indexHtml.matchAll(
      /<a[^>]+href=["'](?:\.\/)?posts\/([^"']+\.html)["'][\s\S]*?<img[^>]+src=["']([^"']+)/gi,
    )) {
      const [, postFileName, cardSrc] = match;
      const expectedHero = postHeroByFile.get(postFileName);
      const image = normalizeImage(cardSrc);

      if (!expectedHero) {
        failures.push(`blog/index.html: card links to unknown post ${postFileName}`);
        continue;
      }

      if (image !== expectedHero) {
        failures.push(
          `blog/index.html: ${postFileName} card image must match hero (${expectedHero}), found ${image}`,
        );
      }

      const current = cardImages.get(image) || [];
      current.push(postFileName);
      cardImages.set(image, current);
    }

    for (const [image, postFileNames] of cardImages.entries()) {
      if (image && postFileNames.length > 1) {
        failures.push(`blog/index.html: duplicate card image ${image}: ${postFileNames.join(", ")}`);
      }
    }
  }

  if (failures.length) {
    console.error("Blog image QA failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }

  console.log(`Blog image QA passed: ${posts.length} published posts have unique, aligned images.`);
}

main();
