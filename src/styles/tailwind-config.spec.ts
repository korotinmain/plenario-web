import { generateSearchDirectories, loadPostcssConfiguration } from '@angular/build/private';
import { describe, expect, it } from 'vitest';

describe('Tailwind PostCSS configuration', () => {
  it('is discoverable by the Angular builder', async () => {
    const searchDirectories = await generateSearchDirectories([process.cwd(), process.cwd()]);
    const postcssConfiguration = await loadPostcssConfiguration(searchDirectories);

    expect(postcssConfiguration).toBeDefined();
    expect(postcssConfiguration?.config.plugins).toContainEqual(['@tailwindcss/postcss', {}]);
  });
});
