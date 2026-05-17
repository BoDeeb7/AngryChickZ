'use server';
/**
 * @fileOverview This file provides a Genkit flow for generating marketing headlines.
 *
 * - adminHeadlineGenerator - A function that generates catchy and impactful marketing headlines for product promotions or hero sections.
 * - AdminHeadlineGeneratorInput - The input type for the adminHeadlineGenerator function.
 * - AdminHeadlineGeneratorOutput - The return type for the adminHeadlineGenerator function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AdminHeadlineGeneratorInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  productDescription: z.string().describe('A brief description of the product.'),
  productCategory: z.string().describe('The category of the product (e.g., Tech, Fashion, Lifestyle, Accessories).'),
  keywords: z.array(z.string()).optional().describe('Optional: A list of relevant keywords to include in the headline.'),
  targetAudience: z.string().optional().describe('Optional: The specific target audience for the headline (e.g., young professionals, gamers, fashion enthusiasts).'),
});
export type AdminHeadlineGeneratorInput = z.infer<typeof AdminHeadlineGeneratorInputSchema>;

const AdminHeadlineGeneratorOutputSchema = z.object({
  headline: z.string().describe('A catchy and impactful marketing headline.'),
});
export type AdminHeadlineGeneratorOutput = z.infer<typeof AdminHeadlineGeneratorOutputSchema>;

export async function adminHeadlineGenerator(input: AdminHeadlineGeneratorInput): Promise<AdminHeadlineGeneratorOutput> {
  return adminHeadlineGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adminHeadlineGeneratorPrompt',
  input: { schema: AdminHeadlineGeneratorInputSchema },
  output: { schema: AdminHeadlineGeneratorOutputSchema },
  prompt: `You are an expert marketing copywriter specializing in creating catchy and impactful headlines for e-commerce platforms.

Generate a single, short, and highly engaging marketing headline for the product described below. The headline should be designed to attract attention for product promotions or a hero section.

Product Name: {{{productName}}}
Product Description: {{{productDescription}}}
Product Category: {{{productCategory}}}

{{#if keywords}}
Keywords to consider: {{#each keywords}}- {{{this}}}{{/each}}
{{/if}}

{{#if targetAudience}}
Target Audience: {{{targetAudience}}}
{{/if}}

The headline should be: 
- Catchy and memorable.
- Impactful and benefit-oriented.
- Appropriate for an ultra-modern, glamorous e-commerce platform called "Velozi".
- Optimized for a premium feel, avoiding generic phrasing.
- Relatively concise.

Generate only the headline, do not include any additional text or explanations.
`,
});

const adminHeadlineGeneratorFlow = ai.defineFlow(
  {
    name: 'adminHeadlineGeneratorFlow',
    inputSchema: AdminHeadlineGeneratorInputSchema,
    outputSchema: AdminHeadlineGeneratorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
