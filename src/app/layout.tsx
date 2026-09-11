import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ConvertioLite - Free Client-Side File Converter',
  description: 'Convert files locally on your device. Fast, secure, and free file converter for Markdown, PDF, Word, Images, and Spreadsheets.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-white text-black antialiased font-mono`}>
        <div dangerouslySetInnerHTML={{ __html: `<!--
THESIS: Raw, utilitarian minimalism that treats the UI like a physical label tag, refusing the category-default generic white card.
OWN-WORLD: Stockroom white cotton ground, black nylon borders and text, hazard diagonals for structure, and safety orange zip-tie accents. Bold industrial caps inside straight quotation marks.
STORY: The visitor understands this is a fast, no-nonsense utility tool that performs the exact job requested without friction.
FIRST VIEWPORT: A stark white field with black borders framing the tool. The file drop zone is a central label tag. Primary actions are marked with an orange zip-tie accent.
FORM: Industrial Streetwear (6). Seed key 929535da.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
-->` }} />
        {children}
      </body>
    </html>
  );
}
