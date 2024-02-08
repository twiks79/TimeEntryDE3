import React from 'react';
import fs from 'fs';
import path from 'path';
import { serialize } from 'next-mdx-remote/serialize';
import { MDXRemote } from 'next-mdx-remote';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Mapping for custom titles, using filenames without the .md extension as keys
const customTitles = {
  'terms': 'Terms and Conditions',
  'imprint': 'Imprint Information',
  'privacy': 'Privacy Policy',
  'about': 'About Us',
};

export async function getStaticProps() {
  const markdownFiles = ['terms.md', 'imprint.md', 'privacy.md', 'about.md'];
  const markdownContents = await Promise.all(
    markdownFiles.map(async (filename) => {
      const filePath = path.join(process.cwd(), 'assets', filename);
      const source = fs.readFileSync(filePath, 'utf8');
      return {
        source: await serialize(source),
        filename,
      };
    })
  );

  return {
    props: {
      markdownContents,
    },
  };
}

const AboutPage = ({ markdownContents }) => {
  return (
    <div>
      {markdownContents.map(({ source, filename }, index) => {
        const baseName = filename.replace('.md', '');
        const title = customTitles[baseName] || baseName; // Use custom title if available, else fallback to baseName

        return (
          <Accordion key={filename}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel${index}a-content`}
              id={`panel${index}a-header`}
            >
              <Typography>{title}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <MDXRemote {...source} />
            </AccordionDetails>
          </Accordion>
        );
      })}
    </div>
  );
};

export default AboutPage;
