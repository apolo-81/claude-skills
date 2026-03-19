# AI Crawler Management

## Known AI Crawlers and robots.txt Tokens

| Crawler | Company | Purpose |
|---------|---------|---------|
| GPTBot | OpenAI | Model training |
| OAI-SearchBot | OpenAI | ChatGPT web search index |
| ChatGPT-User | OpenAI | ChatGPT real-time browsing |
| ClaudeBot | Anthropic | Claude web features + training |
| anthropic-ai | Anthropic | Training |
| PerplexityBot | Perplexity | Search index + training |
| Google-Extended | Google | Gemini AI training only |
| CCBot | Common Crawl | Open dataset |

## Key Distinctions
- Blocking `Google-Extended` does NOT affect Google Search or AI Overviews
- Blocking `GPTBot` does NOT prevent ChatGPT from citing via `OAI-SearchBot`
- Allow search-facing crawlers (OAI-SearchBot, ChatGPT-User, PerplexityBot, ClaudeBot) for citation
- Block training-only crawlers (GPTBot, Google-Extended, CCBot) if IP concern
- Never block Googlebot
