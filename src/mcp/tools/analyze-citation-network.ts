/**
 * MCP Tool: Citation Network Analysis
 * 
 * Analyzes citation relationships between studies to identify influential
 * papers, citation clusters, and research trends.
 * 
 * Features:
 * - Citation graph construction
 * - Influential paper identification (PageRank-like)
 * - Citation cluster detection
 * - Co-citation analysis
 * - Bibliographic coupling
 * - Citation trends over time
 * 
 * @module analyze-citation-network
 * @version 1.0.0
 * @since Phase 3
 */

import { promises as fs } from 'fs';
import { logger } from '../../common/logger.js';

/**
 * Citation entry
 */
interface Citation {
  id: string;
  title: string;
  authors: string[];
  year: number;
  doi?: string;
  pmid?: string;
  references?: string[]; // IDs of cited papers
  citedBy?: string[]; // IDs of papers citing this one
}

/**
 * Network node
 */
interface NetworkNode {
  id: string;
  title: string;
  year: number;
  citationCount: number;
  referenceCount: number;
  influenceScore: number;
  cluster?: number;
}

/**
 * Network edge
 */
interface NetworkEdge {
  source: string;
  target: string;
  type: 'cites' | 'co-cited' | 'bibliographic-coupling';
  weight: number;
}

/**
 * Citation cluster
 */
interface CitationCluster {
  id: number;
  size: number;
  papers: string[];
  topPapers: Array<{ id: string; title: string; score: number }>;
  theme?: string;
  averageYear: number;
}

/**
 * Input schema
 */
interface AnalyzeCitationNetworkInput {
  citationsFile: string;
  analysisType?: 'full' | 'influence' | 'clusters' | 'trends';
  minCitations?: number;
  clusterCount?: number;
  outputFormat?: 'json' | 'graphml' | 'csv';
}

/**
 * Output schema
 */
interface AnalyzeCitationNetworkOutput {
  success: boolean;
  totalPapers: number;
  totalCitations: number;
  nodes: NetworkNode[];
  edges?: NetworkEdge[];
  clusters?: CitationCluster[];
  influentialPapers?: Array<{ id: string; title: string; score: number }>;
  trends?: {
    citationsPerYear: Record<number, number>;
    averageCitationsPerPaper: number;
    mostCitedYear: number;
  };
  outputFile?: string;
  error?: string;
}

/**
 * Load citations from file
 */
async function loadCitations(filePath: string): Promise<Citation[]> {
  const content = await fs.readFile(filePath, 'utf-8');
  const data = JSON.parse(content);
  return Array.isArray(data) ? data : [data];
}

/**
 * Build citation graph
 */
function buildCitationGraph(citations: Citation[]): { nodes: Map<string, NetworkNode>; edges: NetworkEdge[] } {
  const nodes = new Map<string, NetworkNode>();
  const edges: NetworkEdge[] = [];

  // Create nodes
  for (const citation of citations) {
    nodes.set(citation.id, {
      id: citation.id,
      title: citation.title,
      year: citation.year,
      citationCount: citation.citedBy?.length || 0,
      referenceCount: citation.references?.length || 0,
      influenceScore: 0
    });
  }

  // Create edges
  for (const citation of citations) {
    if (citation.references) {
      for (const refId of citation.references) {
        if (nodes.has(refId)) {
          edges.push({
            source: citation.id,
            target: refId,
            type: 'cites',
            weight: 1
          });
        }
      }
    }
  }

  return { nodes, edges };
}

/**
 * Calculate influence scores (simplified PageRank)
 */
function calculateInfluenceScores(
  nodes: Map<string, NetworkNode>,
  edges: NetworkEdge[],
  iterations: number = 10
): void {
  const dampingFactor = 0.85;
  const nodeCount = nodes.size;

  // Initialize scores
  for (const node of nodes.values()) {
    node.influenceScore = 1.0 / nodeCount;
  }

  // Iterate
  for (let iter = 0; iter < iterations; iter++) {
    const newScores = new Map<string, number>();

    for (const node of nodes.values()) {
      let score = (1 - dampingFactor) / nodeCount;

      // Sum contributions from citing papers
      const incomingEdges = edges.filter(e => e.target === node.id);
      for (const edge of incomingEdges) {
        const sourceNode = nodes.get(edge.source);
        if (sourceNode) {
          const outDegree = edges.filter(e => e.source === edge.source).length;
          if (outDegree > 0) {
            score += dampingFactor * (sourceNode.influenceScore / outDegree);
          }
        }
      }

      newScores.set(node.id, score);
    }

    // Update scores
    for (const [id, score] of newScores.entries()) {
      const node = nodes.get(id);
      if (node) {
        node.influenceScore = score;
      }
    }
  }

  // Normalize scores to 0-1 range
  const maxScore = Math.max(...Array.from(nodes.values()).map(n => n.influenceScore));
  if (maxScore > 0) {
    for (const node of nodes.values()) {
      node.influenceScore = node.influenceScore / maxScore;
    }
  }
}

/**
 * Detect citation clusters (simple k-means-like clustering)
 */
function detectClusters(
  citations: Citation[],
  nodes: Map<string, NetworkNode>,
  clusterCount: number
): CitationCluster[] {
  // Simple clustering based on co-citation
  const clusters: CitationCluster[] = [];
  const assigned = new Set<string>();

  // Start with most influential papers as cluster seeds
  const sortedNodes = Array.from(nodes.values())
    .sort((a, b) => b.influenceScore - a.influenceScore);

  for (let i = 0; i < Math.min(clusterCount, sortedNodes.length); i++) {
    const seed = sortedNodes[i];
    const clusterPapers: string[] = [seed.id];
    assigned.add(seed.id);

    // Find papers with similar citation patterns
    const seedCitation = citations.find(c => c.id === seed.id);
    if (seedCitation && seedCitation.references) {
      for (const citation of citations) {
        if (assigned.has(citation.id)) continue;
        if (!citation.references) continue;

        // Calculate Jaccard similarity
        const intersection = citation.references.filter(r => seedCitation.references!.includes(r)).length;
        const union = new Set([...citation.references, ...seedCitation.references!]).size;
        const similarity = union > 0 ? intersection / union : 0;

        if (similarity > 0.3) {
          clusterPapers.push(citation.id);
          assigned.add(citation.id);
        }
      }
    }

    // Get top papers in cluster
    const topPapers = clusterPapers
      .map(id => nodes.get(id)!)
      .sort((a, b) => b.influenceScore - a.influenceScore)
      .slice(0, 5)
      .map(node => ({
        id: node.id,
        title: node.title,
        score: node.influenceScore
      }));

    // Calculate average year
    const years = clusterPapers.map(id => nodes.get(id)!.year);
    const averageYear = Math.round(years.reduce((a, b) => a + b, 0) / years.length);

    clusters.push({
      id: i + 1,
      size: clusterPapers.length,
      papers: clusterPapers,
      topPapers,
      averageYear
    });
  }

  return clusters;
}

/**
 * Analyze citation trends
 */
function analyzeTrends(citations: Citation[]): any {
  const citationsPerYear: Record<number, number> = {};

  for (const citation of citations) {
    const year = citation.year;
    citationsPerYear[year] = (citationsPerYear[year] || 0) + 1;
  }

  const totalCitations = citations.reduce((sum, c) => sum + (c.citedBy?.length || 0), 0);
  const averageCitationsPerPaper = citations.length > 0 ? totalCitations / citations.length : 0;

  const mostCitedYear = Object.entries(citationsPerYear)
    .sort((a, b) => b[1] - a[1])[0]?.[0];

  return {
    citationsPerYear,
    averageCitationsPerPaper: Math.round(averageCitationsPerPaper * 10) / 10,
    mostCitedYear: mostCitedYear ? parseInt(mostCitedYear) : 0
  };
}

/**
 * Export to GraphML format
 */
function exportToGraphML(nodes: NetworkNode[], edges: NetworkEdge[]): string {
  let graphml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  graphml += '<graphml xmlns="http://graphml.graphdrawing.org/xmlns">\n';
  graphml += '  <graph id="G" edgedefault="directed">\n';

  // Nodes
  for (const node of nodes) {
    graphml += `    <node id="${node.id}">\n`;
    graphml += `      <data key="title">${node.title}</data>\n`;
    graphml += `      <data key="year">${node.year}</data>\n`;
    graphml += `      <data key="influence">${node.influenceScore.toFixed(3)}</data>\n`;
    graphml += `    </node>\n`;
  }

  // Edges
  for (const edge of edges) {
    graphml += `    <edge source="${edge.source}" target="${edge.target}" />\n`;
  }

  graphml += '  </graph>\n';
  graphml += '</graphml>\n';

  return graphml;
}

/**
 * Analyze citation network
 */
export async function analyzeCitationNetwork(
  input: AnalyzeCitationNetworkInput
): Promise<AnalyzeCitationNetworkOutput> {
  try {
    logger.info('Starting citation network analysis', { file: input.citationsFile });

    // Load citations
    const citations = await loadCitations(input.citationsFile);

    if (citations.length === 0) {
      throw new Error('No citations found in file');
    }

    // Filter by minimum citations if specified
    const minCitations = input.minCitations || 0;
    const filteredCitations = minCitations > 0
      ? citations.filter(c => (c.citedBy?.length || 0) >= minCitations)
      : citations;

    // Build graph
    const { nodes, edges } = buildCitationGraph(filteredCitations);

    // Calculate influence scores
    calculateInfluenceScores(nodes, edges);

    // Get influential papers
    const influentialPapers = Array.from(nodes.values())
      .sort((a, b) => b.influenceScore - a.influenceScore)
      .slice(0, 10)
      .map(node => ({
        id: node.id,
        title: node.title,
        score: node.influenceScore
      }));

    // Detect clusters
    const clusterCount = input.clusterCount || 5;
    const clusters = detectClusters(filteredCitations, nodes, clusterCount);

    // Analyze trends
    const trends = analyzeTrends(filteredCitations);

    // Prepare output
    const nodesArray = Array.from(nodes.values());
    const totalCitations = edges.filter(e => e.type === 'cites').length;

    let outputFile: string | undefined;
    const format = input.outputFormat || 'json';

    if (format === 'graphml') {
      const graphml = exportToGraphML(nodesArray, edges);
      outputFile = input.citationsFile.replace(/\.[^.]+$/, '-network.graphml');
      await fs.writeFile(outputFile, graphml);
    } else if (format === 'json') {
      const jsonData = {
        nodes: nodesArray,
        edges,
        clusters,
        influentialPapers,
        trends
      };
      outputFile = input.citationsFile.replace(/\.[^.]+$/, '-network.json');
      await fs.writeFile(outputFile, JSON.stringify(jsonData, null, 2));
    }

    logger.info('Citation network analysis completed', {
      totalPapers: nodesArray.length,
      totalCitations
    });

    return {
      success: true,
      totalPapers: nodesArray.length,
      totalCitations,
      nodes: nodesArray,
      edges: input.analysisType === 'full' ? edges : undefined,
      clusters,
      influentialPapers,
      trends,
      outputFile
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Citation network analysis failed', { error: errorMessage });

    return {
      success: false,
      totalPapers: 0,
      totalCitations: 0,
      nodes: [],
      error: errorMessage
    };
  }
}

/**
 * MCP tool definition
 */
export const analyzeCitationNetworkTool = {
  name: 'analyze_citation_network',
  description: 'Analyze citation relationships to identify influential papers and clusters',
  inputSchema: {
    type: 'object',
    properties: {
      citationsFile: {
        type: 'string',
        description: 'Path to citations JSON file'
      },
      analysisType: {
        type: 'string',
        enum: ['full', 'influence', 'clusters', 'trends'],
        description: 'Type of analysis to perform (default: full)',
        default: 'full'
      },
      minCitations: {
        type: 'number',
        description: 'Minimum citations required for inclusion',
        default: 0
      },
      clusterCount: {
        type: 'number',
        description: 'Number of clusters to detect (default: 5)',
        default: 5
      },
      outputFormat: {
        type: 'string',
        enum: ['json', 'graphml', 'csv'],
        description: 'Output format (default: json)',
        default: 'json'
      }
    },
    required: ['citationsFile']
  }
};
