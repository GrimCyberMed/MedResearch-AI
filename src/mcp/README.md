# MedResearch AI - MCP Server

Model Context Protocol (MCP) server providing tools for systematic reviews and meta-analyses.

## Overview

This MCP server exposes 9 tools for conducting systematic reviews:

### Medical Database Tools
1. **search_pubmed** - Search PubMed/MEDLINE with advanced syntax
2. **search_europe_pmc** - Search Europe PMC with full-text capability

### R Statistics Tools
3. **run_meta_analysis** - Execute meta-analysis using R meta package
4. **generate_forest_plot** - Create forest plot visualizations

### Citation Management Tools
5. **manage_citations** - Verify and retrieve citation metadata
6. **export_bibliography** - Export formatted bibliographies

### Document Generation Tools
7. **generate_document** - Generate DOCX manuscripts from markdown
8. **export_to_pdf** - Convert DOCX to PDF

### Open Access Tools
9. **find_open_access** - Find OA versions using Unpaywall API

## Installation

### Prerequisites

**Required**:
- Node.js ≥18.0.0
- npm or yarn

**Optional** (for full functionality):
- R ≥4.0.0 with `meta` and `jsonlite` packages
- Pandoc (for document generation)
- LibreOffice (for PDF export)

### Install Dependencies

```bash
cd src/mcp
npm install
```

### Install R Packages (Optional)

```r
install.packages(c("meta", "jsonlite"))
```

### Build TypeScript

```bash
npm run build
```

## Configuration

### Claude Desktop Integration

Add to Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on Mac, `%APPDATA%\Claude\claude_desktop_config.json` on Windows):

```json
{
  "mcpServers": {
    "medresearch-ai": {
      "command": "node",
      "args": ["/path/to/MedResearch-AI/src/mcp/index.js"]
    }
  }
}
```

### Environment Variables

Create `.env` file (optional):

```
# Unpaywall API (requires email)
UNPAYWALL_EMAIL=your.email@example.com

# Zotero API (for full citation management)
ZOTERO_API_KEY=your_api_key
ZOTERO_USER_ID=your_user_id
```

## Usage

### Tool 1: search_pubmed

Search PubMed/MEDLINE database.

**Parameters**:
- `query` (string, required): PubMed search query with MeSH terms and field tags
- `max_results` (number, optional): Maximum results (default: 100, max: 10000)
- `sort` (string, optional): Sort order - "relevance", "date", or "author"
- `filters` (object, optional):
  - `date_from` (string): Start date (YYYY-MM-DD)
  - `date_to` (string): End date (YYYY-MM-DD)
  - `article_types` (array): Article types (e.g., ["randomized controlled trial"])
  - `languages` (array): Language codes (e.g., ["eng"])

**Example**:
```json
{
  "query": "(\"depressive disorder\"[MeSH] OR depression[tiab]) AND (\"cognitive behavioral therapy\"[MeSH] OR CBT[tiab]) AND randomized controlled trial[pt]",
  "max_results": 100,
  "filters": {
    "date_from": "2015-01-01",
    "date_to": "2025-12-31"
  }
}
```

**Returns**:
```json
{
  "success": true,
  "query": "...",
  "count": 1247,
  "retrieved": 100,
  "results": [
    {
      "pmid": "12345678",
      "doi": "10.1001/jama.2020.12345",
      "title": "Effectiveness of CBT for Depression",
      "authors": ["Smith J", "Jones A"],
      "journal": "JAMA",
      "year": 2020,
      "abstract": "...",
      "url": "https://pubmed.ncbi.nlm.nih.gov/12345678/"
    }
  ]
}
```

### Tool 2: search_europe_pmc

Search Europe PMC database.

**Parameters**:
- `query` (string, required): Europe PMC query (supports TITLE:, ABSTRACT:, etc.)
- `max_results` (number, optional): Maximum results (default: 100)
- `include_preprints` (boolean, optional): Include preprints (default: true)

**Example**:
```json
{
  "query": "TITLE:depression AND ABSTRACT:CBT",
  "max_results": 50,
  "include_preprints": true
}
```

### Tool 3: run_meta_analysis

Execute meta-analysis using R.

**Parameters**:
- `data` (array, required): Study data with effect sizes
  - `study_id` (string): Study identifier
  - `effect_size` (number): Effect size (SMD, MD, log RR, log OR, etc.)
  - `standard_error` (number): Standard error of effect size
  - `sample_size` (number, optional): Total sample size
- `effect_measure` (string, required): "SMD", "MD", "RR", "OR", or "HR"
- `model` (string, optional): "random" or "fixed" (default: "random")
- `method` (string, optional): "REML", "DL", "PM", or "ML" (default: "REML")

**Example**:
```json
{
  "data": [
    {"study_id": "Smith2020", "effect_size": -0.45, "standard_error": 0.12, "sample_size": 200},
    {"study_id": "Jones2019", "effect_size": -0.38, "standard_error": 0.15, "sample_size": 150}
  ],
  "effect_measure": "SMD",
  "model": "random",
  "method": "REML"
}
```

**Returns**:
```json
{
  "success": true,
  "result": {
    "pooled_effect": -0.42,
    "ci_lower": -0.58,
    "ci_upper": -0.26,
    "p_value": 0.001,
    "i_squared": 45.2,
    "tau_squared": 0.04,
    "q_statistic": 25.5,
    "q_p_value": 0.04,
    "prediction_interval": {
      "lower": -0.72,
      "upper": -0.12
    },
    "studies": [...],
    "model": "random",
    "method": "REML",
    "k_studies": 15
  }
}
```

### Tool 4: generate_forest_plot

Generate forest plot from meta-analysis results.

**Parameters**:
- `meta_analysis_result` (object, required): Result from run_meta_analysis
- `output_path` (string, required): Output file path (.png or .pdf)
- `title` (string, optional): Plot title
- `show_prediction_interval` (boolean, optional): Show prediction interval (default: true)

**Example**:
```json
{
  "meta_analysis_result": {...},
  "output_path": "/path/to/forest_plot.png",
  "title": "CBT vs Control for Depression",
  "show_prediction_interval": true
}
```

### Tool 5: manage_citations

Verify and retrieve citation metadata.

**Parameters**:
- `action` (string, required): "verify" or "get"
- `identifier` (string, required): DOI or PMID

**Example**:
```json
{
  "action": "verify",
  "identifier": "10.1001/jama.2020.12345"
}
```

**Returns**:
```json
{
  "success": true,
  "action": "verify",
  "identifier": "10.1001/jama.2020.12345",
  "valid": true,
  "metadata": {
    "doi": "10.1001/jama.2020.12345",
    "title": "...",
    "authors": [...],
    "journal": "JAMA",
    "year": 2020
  }
}
```

### Tool 6: find_open_access

Find open access versions using Unpaywall.

**Parameters**:
- `identifiers` (array, required): Array of DOIs or PMIDs
- `email` (string, required): Email for Unpaywall API

**Example**:
```json
{
  "identifiers": ["10.1001/jama.2020.12345", "12345678"],
  "email": "researcher@university.edu"
}
```

**Returns**:
```json
{
  "success": true,
  "total": 2,
  "open_access": 1,
  "closed_access": 1,
  "oa_percentage": "50.0",
  "results": [
    {
      "doi": "10.1001/jama.2020.12345",
      "is_oa": true,
      "oa_status": "green",
      "oa_url": "https://repository.example.edu/paper.pdf"
    }
  ]
}
```

## Troubleshooting

### R Not Found

**Error**: "Failed to execute R: ... Ensure R is installed and in PATH"

**Solution**:
1. Install R from https://www.r-project.org/
2. Add R to system PATH
3. Install required packages: `install.packages(c("meta", "jsonlite"))`

### PubMed Rate Limiting

**Error**: HTTP 429 (Too Many Requests)

**Solution**:
- Add delays between requests (built-in for Unpaywall)
- Use NCBI API key for higher rate limits
- Consider caching results

### Missing Dependencies

**Error**: "Cannot find module '@modelcontextprotocol/sdk'"

**Solution**:
```bash
cd src/mcp
npm install
```

## Development

### Project Structure

```
src/mcp/
├── index.ts                    # MCP server entry point
├── tools/
│   ├── medical-databases.ts    # PubMed, Europe PMC
│   ├── r-statistics.ts         # Meta-analysis, forest plots
│   ├── citation-manager.ts     # Citation verification
│   ├── document-generator.ts   # DOCX generation
│   └── unpaywall.ts           # Open access finder
├── package.json
├── tsconfig.json
└── README.md
```

### Adding New Tools

1. Create tool implementation in `tools/`
2. Add tool definition to `TOOLS` array in `index.ts`
3. Add handler in `CallToolRequestSchema` switch statement
4. Update this README with usage examples

### Testing

```bash
# Run TypeScript compiler
npm run build

# Test individual tools (create test scripts)
node test-pubmed.js
node test-meta-analysis.js
```

## Limitations

### Current Implementation

**Simplified Features**:
- **Citation Management**: Basic verification only (full Zotero integration requires API credentials)
- **Document Generation**: Text output only (full DOCX requires pandoc or docx library)
- **PDF Export**: Requires external tools (LibreOffice or pandoc)

**Full Implementation Requires**:
- Zotero API credentials for citation management
- Pandoc for document conversion
- LibreOffice for PDF export
- R installation for meta-analysis

### API Rate Limits

- **PubMed**: 3 requests/second without API key, 10/second with key
- **Europe PMC**: No strict limit, but be respectful
- **Unpaywall**: 100,000 requests/day, polite crawling expected
- **CrossRef**: No strict limit for metadata retrieval

## License

MIT License - See LICENSE file in project root

## Support

For issues or questions:
- GitHub Issues: [Project repository]
- Email: [Contact email]
- Documentation: See `.opencode/context/` for methodology guides

## Version

- **Version**: 1.0.0
- **Last Updated**: 2025-12-03
- **Maintained By**: MedResearch AI Team
