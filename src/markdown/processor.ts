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
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
	return String(file);
}

export async function getExpressiveCodeStyles(theme: string): Promise<string> {
	const { ExpressiveCodeEngine } = await import('@expressive-code/core');

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const engine = new ExpressiveCodeEngine({
		themes: [theme as any],
	});

	const baseStyles = await engine.getBaseStyles();
	const themeStyles = await engine.getThemeStyles();

	return baseStyles + '\n' + themeStyles;
}
