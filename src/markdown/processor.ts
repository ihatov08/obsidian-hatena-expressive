import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkFrontmatter from 'remark-frontmatter';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeExpressiveCode from 'rehype-expressive-code';
import rehypeStringify from 'rehype-stringify';
import type { Root, Text } from 'mdast';
import { visit } from 'unist-util-visit';

function remarkRemoveObsidianSyntax() {
	return (tree: Root) => {
		visit(tree, 'text', (node: Text) => {
			// Remove %%comments%%
			node.value = node.value.replace(/%%[\s\S]*?%%/g, '');
		});

		// Convert [[link]] or [[link|display]] to plain text
		visit(tree, 'text', (node: Text) => {
			node.value = node.value.replace(
				/\[\[(?:[^|\]]*\|)?([^\]]+)\]\]/g,
				'$1'
			);
		});
	};
}

export interface ProcessorOptions {
	theme: string;
}

export async function createMarkdownProcessor(options: ProcessorOptions) {
	const processor = unified()
		.use(remarkParse)
		.use(remarkFrontmatter, ['yaml'])
		.use(remarkRemoveObsidianSyntax)
		.use(remarkRehype, { allowDangerousHtml: true })
		.use(rehypeRaw)
		// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
		.use(rehypeExpressiveCode as any, {
			themes: [options.theme],
			defaultProps: {
				showLineNumbers: false,
			},
		})
		.use(rehypeStringify);

	return processor;
}

export async function convertMarkdownToHtml(
	markdown: string,
	options: ProcessorOptions
): Promise<string> {
	const processor = await createMarkdownProcessor(options);
	const file = await processor.process(markdown);
	return stripStyleAndScriptTags(String(file));
}

function stripStyleAndScriptTags(html: string): string {
	return html
		.replace(/<style>[\s\S]*?<\/style>/g, '')
		.replace(/<script[\s\S]*?<\/script>/g, '');
}

export async function getExpressiveCodeStyles(theme: string): Promise<string> {
	// Process a minimal code block through the full pipeline to extract CSS
	const html = await convertMarkdownToHtml(
		'```js\nconsole.log("test")\n```',
		{ theme }
	);

	// Extract all <style> tag contents from the rendered output
	const styleRegex = /<style>([\s\S]*?)<\/style>/g;
	let css = '';
	let match;
	while ((match = styleRegex.exec(html)) !== null) {
		if (match[1]) {
			css += match[1] + '\n';
		}
	}

	if (!css) {
		throw new Error('No CSS was generated. Check your theme setting.');
	}

	return css.trim();
}
