import { useMemo } from 'react';
import { MDXRemote } from 'next-mdx-remote';

const MarkdownRenderer = ({ mdxSource }) => {
  const components = useMemo(() => ({}), []);

  return <MDXRemote {...mdxSource} components={components} />;
};

export default MarkdownRenderer;
