/**
 * Network Geometry Assessment
 * 
 * Assesses the structure and connectivity of a treatment network for network meta-analysis:
 * - Network connectivity (connected vs disconnected)
 * - Number of treatments and comparisons
 * - Direct and indirect evidence
 * - Multi-arm trials
 * - Star-shaped vs well-connected networks
 * - Potential for inconsistency
 * 
 * References:
 * - Salanti et al. (2008) Graphical methods and numerical summaries for presenting results from multiple-treatment meta-analysis
 * - Rücker & Schwarzer (2014) Reduce dimension or reduce weights? Comparing two approaches to multi-arm studies in network meta-analysis
 * - Chaimani et al. (2013) Graphical tools for network meta-analysis in STATA
 * 
 * @version 6.0.0-beta
 */

import { logger } from '../../common/logger.js';

/**
 * Treatment comparison (edge in network)
 */
export interface TreatmentComparison {
  /** Study identifier */
  study_id: string;
  
  /** Treatment A */
  treatment_a: string;
  
  /** Treatment B */
  treatment_b: string;
  
  /** Number of participants in treatment A */
  n_a?: number;
  
  /** Number of participants in treatment B */
  n_b?: number;
  
  /** Effect size (if available) */
  effect_size?: number;
  
  /** Standard error (if available) */
  standard_error?: number;
}

/**
 * Multi-arm trial
 */
export interface MultiArmTrial {
  /** Study identifier */
  study_id: string;
  
  /** Treatments in this trial */
  treatments: string[];
  
  /** Number of arms */
  n_arms: number;
}

/**
 * Treatment node in network
 */
export interface TreatmentNode {
  /** Treatment name */
  treatment: string;
  
  /** Number of studies including this treatment */
  n_studies: number;
  
  /** Total participants receiving this treatment */
  total_participants: number;
  
  /** Number of direct comparisons */
  n_comparisons: number;
  
  /** Connected treatments */
  connected_to: string[];
}

/**
 * Network edge (comparison)
 */
export interface NetworkEdge {
  /** Treatment A */
  treatment_a: string;
  
  /** Treatment B */
  treatment_b: string;
  
  /** Number of studies with this direct comparison */
  n_studies: number;
  
  /** Total participants in this comparison */
  total_participants: number;
  
  /** Is this comparison present? */
  has_direct_evidence: boolean;
}

/**
 * Network geometry assessment result
 */
export interface NetworkGeometryAssessment {
  /** Number of treatments */
  n_treatments: number;
  
  /** Number of studies */
  n_studies: number;
  
  /** Treatment nodes */
  nodes: TreatmentNode[];
  
  /** Network edges (comparisons) */
  edges: NetworkEdge[];
  
  /** Multi-arm trials */
  multi_arm_trials: MultiArmTrial[];
  
  /** Network connectivity */
  connectivity: {
    /** Is network connected? */
    is_connected: boolean;
    
    /** Number of connected components */
    n_components: number;
    
    /** Components (groups of connected treatments) */
    components: string[][];
  };
  
  /** Network characteristics */
  characteristics: {
    /** Is network star-shaped? (one central treatment) */
    is_star_shaped: boolean;
    
    /** Central treatment (if star-shaped) */
    central_treatment?: string;
    
    /** Average number of connections per treatment */
    avg_connections: number;
    
    /** Proportion of possible comparisons with direct evidence */
    completeness: number;
  };
  
  /** Potential issues */
  issues: {
    /** Disconnected network */
    disconnected: boolean;
    
    /** Few studies per comparison */
    sparse_comparisons: boolean;
    
    /** Star-shaped (high risk of inconsistency) */
    star_shaped: boolean;
    
    /** Treatments with only one connection */
    isolated_treatments: string[];
  };
  
  /** Recommendations */
  recommendations: string[];
  
  /** Confidence in the assessment (0-1) */
  confidence: number;
  
  /** Warnings */
  warnings: string[];
}

/**
 * Build adjacency list from comparisons
 */
function buildAdjacencyList(comparisons: TreatmentComparison[]): Map<string, Set<string>> {
  const adjacency = new Map<string, Set<string>>();
  
  for (const comp of comparisons) {
    if (!adjacency.has(comp.treatment_a)) {
      adjacency.set(comp.treatment_a, new Set());
    }
    if (!adjacency.has(comp.treatment_b)) {
      adjacency.set(comp.treatment_b, new Set());
    }
    
    adjacency.get(comp.treatment_a)!.add(comp.treatment_b);
    adjacency.get(comp.treatment_b)!.add(comp.treatment_a);
  }
  
  return adjacency;
}

/**
 * Find connected components using DFS
 */
function findConnectedComponents(adjacency: Map<string, Set<string>>): string[][] {
  const visited = new Set<string>();
  const components: string[][] = [];
  
  function dfs(node: string, component: string[]) {
    visited.add(node);
    component.push(node);
    
    const neighbors = adjacency.get(node) || new Set();
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        dfs(neighbor, component);
      }
    }
  }
  
  for (const node of adjacency.keys()) {
    if (!visited.has(node)) {
      const component: string[] = [];
      dfs(node, component);
      components.push(component);
    }
  }
  
  return components;
}

/**
 * Check if network is star-shaped
 */
function isStarShaped(adjacency: Map<string, Set<string>>): { is_star: boolean; center?: string } {
  const treatments = Array.from(adjacency.keys());
  
  if (treatments.length < 3) {
    return { is_star: false };
  }
  
  // Find treatment with most connections
  let maxConnections = 0;
  let centralTreatment = '';
  
  for (const [treatment, connections] of adjacency.entries()) {
    if (connections.size > maxConnections) {
      maxConnections = connections.size;
      centralTreatment = treatment;
    }
  }
  
  // Star-shaped if:
  // 1. One treatment connects to all others
  // 2. Other treatments only connect to the central treatment
  
  const nTreatments = treatments.length;
  if (maxConnections !== nTreatments - 1) {
    return { is_star: false };
  }
  
  // Check if other treatments only connect to center
  for (const [treatment, connections] of adjacency.entries()) {
    if (treatment === centralTreatment) continue;
    
    if (connections.size !== 1 || !connections.has(centralTreatment)) {
      return { is_star: false };
    }
  }
  
  return { is_star: true, center: centralTreatment };
}

/**
 * Identify multi-arm trials
 */
function identifyMultiArmTrials(comparisons: TreatmentComparison[]): MultiArmTrial[] {
  const studyTreatments = new Map<string, Set<string>>();
  
  for (const comp of comparisons) {
    if (!studyTreatments.has(comp.study_id)) {
      studyTreatments.set(comp.study_id, new Set());
    }
    
    studyTreatments.get(comp.study_id)!.add(comp.treatment_a);
    studyTreatments.get(comp.study_id)!.add(comp.treatment_b);
  }
  
  const multiArmTrials: MultiArmTrial[] = [];
  
  for (const [studyId, treatments] of studyTreatments.entries()) {
    if (treatments.size > 2) {
      multiArmTrials.push({
        study_id: studyId,
        treatments: Array.from(treatments),
        n_arms: treatments.size,
      });
    }
  }
  
  return multiArmTrials;
}

/**
 * Build treatment nodes
 */
function buildTreatmentNodes(
  comparisons: TreatmentComparison[],
  adjacency: Map<string, Set<string>>
): TreatmentNode[] {
  const nodeData = new Map<string, { studies: Set<string>; participants: number }>();
  
  // Initialize all treatments
  for (const treatment of adjacency.keys()) {
    nodeData.set(treatment, { studies: new Set(), participants: 0 });
  }
  
  // Aggregate data
  for (const comp of comparisons) {
    const dataA = nodeData.get(comp.treatment_a)!;
    const dataB = nodeData.get(comp.treatment_b)!;
    
    dataA.studies.add(comp.study_id);
    dataB.studies.add(comp.study_id);
    
    if (comp.n_a) dataA.participants += comp.n_a;
    if (comp.n_b) dataB.participants += comp.n_b;
  }
  
  // Build nodes
  const nodes: TreatmentNode[] = [];
  
  for (const [treatment, connections] of adjacency.entries()) {
    const data = nodeData.get(treatment)!;
    
    nodes.push({
      treatment,
      n_studies: data.studies.size,
      total_participants: data.participants,
      n_comparisons: connections.size,
      connected_to: Array.from(connections),
    });
  }
  
  return nodes;
}

/**
 * Build network edges
 */
function buildNetworkEdges(comparisons: TreatmentComparison[]): NetworkEdge[] {
  const edgeData = new Map<string, { studies: Set<string>; participants: number }>();
  
  for (const comp of comparisons) {
    // Create canonical edge key (alphabetically sorted)
    const key = [comp.treatment_a, comp.treatment_b].sort().join('|');
    
    if (!edgeData.has(key)) {
      edgeData.set(key, { studies: new Set(), participants: 0 });
    }
    
    const data = edgeData.get(key)!;
    data.studies.add(comp.study_id);
    
    if (comp.n_a) data.participants += comp.n_a;
    if (comp.n_b) data.participants += comp.n_b;
  }
  
  const edges: NetworkEdge[] = [];
  
  for (const [key, data] of edgeData.entries()) {
    const [treatmentA, treatmentB] = key.split('|');
    
    edges.push({
      treatment_a: treatmentA,
      treatment_b: treatmentB,
      n_studies: data.studies.size,
      total_participants: data.participants,
      has_direct_evidence: true,
    });
  }
  
  return edges;
}

/**
 * Assess network geometry
 */
export function assessNetworkGeometry(comparisons: TreatmentComparison[]): NetworkGeometryAssessment {
  const warnings: string[] = [];
  const recommendations: string[] = [];
  
  // Validate
  if (comparisons.length === 0) {
    throw new Error('No comparisons provided for network geometry assessment');
  }
  
  // Build adjacency list
  const adjacency = buildAdjacencyList(comparisons);
  
  // Find connected components
  const components = findConnectedComponents(adjacency);
  const isConnected = components.length === 1;
  
  // Build nodes and edges
  const nodes = buildTreatmentNodes(comparisons, adjacency);
  const edges = buildNetworkEdges(comparisons);
  
  // Identify multi-arm trials
  const multiArmTrials = identifyMultiArmTrials(comparisons);
  
  // Check if star-shaped
  const starCheck = isStarShaped(adjacency);
  
  // Calculate network characteristics
  const nTreatments = adjacency.size;
  const avgConnections = nodes.reduce((sum, n) => sum + n.n_comparisons, 0) / nTreatments;
  const maxPossibleComparisons = (nTreatments * (nTreatments - 1)) / 2;
  const completeness = edges.length / maxPossibleComparisons;
  
  // Identify issues
  const issues = {
    disconnected: !isConnected,
    sparse_comparisons: edges.some(e => e.n_studies < 2),
    star_shaped: starCheck.is_star,
    isolated_treatments: nodes.filter(n => n.n_comparisons === 1).map(n => n.treatment),
  };
  
  // Generate recommendations
  if (issues.disconnected) {
    warnings.push('Network is disconnected - cannot perform network meta-analysis on all treatments');
    recommendations.push('Consider analyzing connected components separately or adding bridging studies');
  }
  
  if (issues.sparse_comparisons) {
    warnings.push('Some comparisons have only one study - results may be unreliable');
    recommendations.push('Interpret results for sparse comparisons with caution');
  }
  
  if (issues.star_shaped) {
    warnings.push('Network is star-shaped - high risk of inconsistency');
    recommendations.push('Carefully assess consistency/coherence; consider sensitivity analyses');
  }
  
  if (issues.isolated_treatments.length > 0) {
    warnings.push(`${issues.isolated_treatments.length} treatment(s) have only one connection`);
    recommendations.push('Results for isolated treatments rely heavily on indirect evidence');
  }
  
  if (multiArmTrials.length > 0) {
    recommendations.push(`${multiArmTrials.length} multi-arm trial(s) detected - ensure proper handling of correlation`);
  }
  
  if (nTreatments < 3) {
    warnings.push('Only 2 treatments - standard pairwise meta-analysis is more appropriate');
  }
  
  // Confidence scoring
  let confidence = 0.7; // Base confidence
  
  if (issues.disconnected) {
    confidence -= 0.2;
  }
  
  if (nTreatments < 3) {
    confidence -= 0.2;
  }
  
  if (issues.sparse_comparisons) {
    confidence -= 0.1;
  }
  
  if (issues.star_shaped) {
    confidence -= 0.1;
  }
  
  // Ensure confidence is in valid range
  confidence = Math.max(0.1, Math.min(0.9, confidence));
  
  return {
    n_treatments: nTreatments,
    n_studies: new Set(comparisons.map(c => c.study_id)).size,
    nodes,
    edges,
    multi_arm_trials: multiArmTrials,
    connectivity: {
      is_connected: isConnected,
      n_components: components.length,
      components,
    },
    characteristics: {
      is_star_shaped: starCheck.is_star,
      central_treatment: starCheck.center,
      avg_connections: avgConnections,
      completeness,
    },
    issues,
    recommendations,
    confidence,
    warnings,
  };
}

/**
 * MCP tool interface for network geometry assessment
 */
export async function assessNetworkGeometryMCP(args: {
  comparisons: TreatmentComparison[];
}): Promise<{
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}> {
  try {
    logger.info('Assessing network geometry', {
      n_comparisons: args.comparisons.length,
    });
    
    const result = assessNetworkGeometry(args.comparisons);
    
    logger.info('Network geometry assessment complete', {
      n_treatments: result.n_treatments,
      n_studies: result.n_studies,
      is_connected: result.connectivity.is_connected,
      confidence: result.confidence,
    });
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    logger.error('Error assessing network geometry', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    return {
      content: [
        {
          type: 'text',
          text: `Error assessing network geometry: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}
