import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import type { FrontmatterData } from '../types';

const FRONTMATTER_REGEX = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

export function parseFrontmatter(content: string): {
	frontmatter: FrontmatterData;
	body: string;
} {
	const match = content.match(FRONTMATTER_REGEX);

	if (!match) {
		return {
			frontmatter: {},
			body: content,
		};
	}

	const yamlContent = match[1] ?? '';
	const body = content.slice(match[0].length);

	let frontmatter: FrontmatterData = {};
	try {
		const parsed: unknown = parseYaml(yamlContent);
		frontmatter = (parsed && typeof parsed === 'object') ? parsed as FrontmatterData : {};
	} catch {
		frontmatter = {};
	}

	return { frontmatter, body };
}

export function updateFrontmatter(
	content: string,
	updates: Partial<FrontmatterData>
): string {
	const { frontmatter, body } = parseFrontmatter(content);

	const newFrontmatter = { ...frontmatter, ...updates };
	const yamlStr = stringifyYaml(newFrontmatter);

	return `---\n${yamlStr}---\n${body}`;
}

export function extractTitle(frontmatter: FrontmatterData, body: string, filename: string): string {
	if (frontmatter.title) {
		return frontmatter.title;
	}

	// Try to extract from first H1
	const h1Match = body.match(/^#\s+(.+)$/m);
	if (h1Match?.[1]) {
		return h1Match[1].trim();
	}

	// Fallback to filename without extension
	return filename.replace(/\.md$/, '');
}

export function extractCategories(frontmatter: FrontmatterData): string[] {
	if (Array.isArray(frontmatter.categories)) {
		return frontmatter.categories;
	}
	if (Array.isArray(frontmatter.tags)) {
		return frontmatter.tags as string[];
	}
	return [];
}
