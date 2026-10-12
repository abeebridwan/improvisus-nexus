import { readdir, readFile } from "node:fs/promises";

import path from "node:path";

import type { RepoFile } from "./types";

const ignoredDirectories = new Set(["node_modules", ".git", "dist", "build", ".next", "coverage"]);

const allowedExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".html", ".json"]);

async function walk(root: string, current = root): Promise<string[]> {
  const entries = await readdir(current, {
    withFileTypes: true,
  });

  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(current, entry.name);

    if (entry.isDirectory()) {
      if (ignoredDirectories.has(entry.name)) {
        continue;
      }

      files.push(...(await walk(root, fullPath)));

      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const extension = path.extname(entry.name);

    if (entry.name !== "package.json" && !allowedExtensions.has(extension)) {
      continue;
    }

    files.push(fullPath);
  }

  return files;
}

function getTerms(workflow: string) {
  return (
    workflow
      .toLowerCase()
      .match(/[a-z0-9_]+/g)
      ?.filter((term) => term.length >= 4) ?? []
  );
}

export async function discoverRepository(projectPath: string, workflow: string): Promise<RepoFile[]> {
  const absoluteFiles = await walk(projectPath);

  const terms = getTerms(workflow);

  const ranked: RepoFile[] = [];

  for (const absolutePath of absoluteFiles) {
    const relativePath = path.relative(projectPath, absolutePath).replaceAll("\\", "/");

    let content: string;

    try {
      content = await readFile(absolutePath, "utf8");
    } catch {
      continue;
    }

    if (content.length > 40_000) {
      continue;
    }

    const haystack = (relativePath + "\n" + content).toLowerCase();

    let score = 0;

    for (const term of terms) {
      const matches = haystack.split(term).length - 1;

      score += matches;
    }

    if (
      relativePath === "package.json" ||
      relativePath === "src/main.tsx" ||
      relativePath === "src/App.tsx"
    ) {
      score += 5;
    }

    if (score > 0) {
      ranked.push({
        path: relativePath,
        content,
        score,
      });
    }
  }

  ranked.sort((a, b) => b.score - a.score);

  return ranked.slice(0, 24).map((file) => ({
    ...file,

    content: file.content.slice(0, 12_000),
  }));
}
