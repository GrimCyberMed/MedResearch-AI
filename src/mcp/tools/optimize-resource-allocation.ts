/**
 * Resource Allocation Optimizer
 * 
 * Optimizes resource allocation for systematic review projects.
 * Analyzes project requirements, team capabilities, and task dependencies
 * to recommend optimal resource distribution and task prioritization.
 * 
 * Features:
 * - Team member skill matching
 * - Workload balancing
 * - Task prioritization by impact
 * - Timeline optimization
 * - Resource bottleneck identification
 * - Effort estimation
 * 
 * @module optimize-resource-allocation
 * @version 1.0.0
 */

import { logger } from '../../common/logger.js';

/**
 * Team member definition
 */
export interface TeamMember {
  id: string;
  name: string;
  role: 'lead_researcher' | 'co_researcher' | 'statistician' | 'screener' | 'data_extractor' | 'writer';
  skills: string[];
  availability: number; // hours per week
  currentWorkload: number; // hours currently allocated
  experienceLevel: 'junior' | 'intermediate' | 'senior' | 'expert';
}

/**
 * Task definition
 */
export interface Task {
  id: string;
  name: string;
  phase: 'planning' | 'search' | 'screening' | 'extraction' | 'quality_assessment' | 'analysis' | 'writing';
  requiredSkills: string[];
  estimatedHours: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  dependencies: string[]; // task IDs that must be completed first
  deadline?: string;
  complexity: 'simple' | 'moderate' | 'complex' | 'very_complex';
}

/**
 * Resource allocation input
 */
export interface OptimizeResourceAllocationInput {
  project_id: string;
  project_name: string;
  team_members: TeamMember[];
  tasks: Task[];
  project_deadline?: string;
  optimization_goal?: 'minimize_time' | 'balance_workload' | 'maximize_quality' | 'minimize_cost';
}

/**
 * Task assignment
 */
export interface TaskAssignment {
  task_id: string;
  task_name: string;
  assigned_to: string[]; // team member IDs
  estimated_hours: number;
  start_date: string;
  end_date: string;
  priority_score: number;
  skill_match_score: number;
  rationale: string;
}

/**
 * Resource allocation output
 */
export interface OptimizeResourceAllocationOutput {
  success: boolean;
  project_id: string;
  project_name: string;
  optimization_goal: string;
  total_tasks: number;
  total_team_members: number;
  total_estimated_hours: number;
  assignments: TaskAssignment[];
  workload_distribution: {
    member_id: string;
    member_name: string;
    allocated_hours: number;
    available_hours: number;
    utilization_percentage: number;
    assigned_tasks: number;
  }[];
  timeline: {
    estimated_start: string;
    estimated_completion: string;
    total_duration_days: number;
    critical_path: string[];
  };
  bottlenecks: {
    type: 'skill_gap' | 'overallocation' | 'dependency' | 'timeline';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    affected_tasks: string[];
    recommendation: string;
  }[];
  recommendations: string[];
  quality_score: number; // 0-100
  feasibility_score: number; // 0-100
  message: string;
  error?: string;
}

/**
 * Optimize resource allocation for a systematic review project
 */
export async function optimizeResourceAllocation(
  input: OptimizeResourceAllocationInput
): Promise<OptimizeResourceAllocationOutput> {
  try {
    logger.info('Optimizing resource allocation', {
      project_id: input.project_id,
      team_size: input.team_members.length,
      task_count: input.tasks.length,
    });

    // Validate input
    const validation = validateInput(input);
    if (!validation.valid) {
      return {
        success: false,
        project_id: input.project_id,
        project_name: input.project_name,
        optimization_goal: input.optimization_goal || 'balance_workload',
        total_tasks: input.tasks.length,
        total_team_members: input.team_members.length,
        total_estimated_hours: 0,
        assignments: [],
        workload_distribution: [],
        timeline: {
          estimated_start: new Date().toISOString(),
          estimated_completion: new Date().toISOString(),
          total_duration_days: 0,
          critical_path: [],
        },
        bottlenecks: [],
        recommendations: [],
        quality_score: 0,
        feasibility_score: 0,
        message: 'Validation failed',
        error: validation.errors.join('; '),
      };
    }

    // Calculate total estimated hours
    const totalEstimatedHours = input.tasks.reduce((sum, task) => sum + task.estimatedHours, 0);

    // Prioritize tasks
    const prioritizedTasks = prioritizeTasks(input.tasks);

    // Match tasks to team members
    const assignments = assignTasksToTeam(
      prioritizedTasks,
      input.team_members,
      input.optimization_goal || 'balance_workload'
    );

    // Calculate workload distribution
    const workloadDistribution = calculateWorkloadDistribution(input.team_members, assignments);

    // Estimate timeline
    const timeline = estimateTimeline(assignments, input.tasks, input.project_deadline);

    // Identify bottlenecks
    const bottlenecks = identifyBottlenecks(
      input.team_members,
      assignments,
      workloadDistribution,
      timeline
    );

    // Generate recommendations
    const recommendations = generateRecommendations(
      input.team_members,
      assignments,
      workloadDistribution,
      bottlenecks,
      input.optimization_goal || 'balance_workload'
    );

    // Calculate quality and feasibility scores
    const qualityScore = calculateQualityScore(assignments, input.team_members);
    const feasibilityScore = calculateFeasibilityScore(
      workloadDistribution,
      bottlenecks,
      timeline,
      input.project_deadline
    );

    logger.info('Resource allocation optimization complete', {
      project_id: input.project_id,
      assignments: assignments.length,
      quality_score: qualityScore,
      feasibility_score: feasibilityScore,
    });

    return {
      success: true,
      project_id: input.project_id,
      project_name: input.project_name,
      optimization_goal: input.optimization_goal || 'balance_workload',
      total_tasks: input.tasks.length,
      total_team_members: input.team_members.length,
      total_estimated_hours: totalEstimatedHours,
      assignments,
      workload_distribution: workloadDistribution,
      timeline,
      bottlenecks,
      recommendations,
      quality_score: qualityScore,
      feasibility_score: feasibilityScore,
      message: `Successfully optimized resource allocation for ${input.tasks.length} tasks across ${input.team_members.length} team members`,
    };
  } catch (error) {
    logger.error('Resource allocation optimization failed', { error });
    throw error;
  }
}

/**
 * Validate input
 */
function validateInput(input: OptimizeResourceAllocationInput): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!input.project_id) {
    errors.push('Project ID is required');
  }

  if (!input.team_members || input.team_members.length === 0) {
    errors.push('At least one team member is required');
  }

  if (!input.tasks || input.tasks.length === 0) {
    errors.push('At least one task is required');
  }

  // Validate team members
  input.team_members.forEach((member, index) => {
    if (!member.id) errors.push(`Team member ${index} missing ID`);
    if (!member.name) errors.push(`Team member ${index} missing name`);
    if (member.availability <= 0) errors.push(`Team member ${member.name} has invalid availability`);
  });

  // Validate tasks
  input.tasks.forEach((task, index) => {
    if (!task.id) errors.push(`Task ${index} missing ID`);
    if (!task.name) errors.push(`Task ${index} missing name`);
    if (task.estimatedHours <= 0) errors.push(`Task ${task.name} has invalid estimated hours`);
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Prioritize tasks based on multiple factors
 */
function prioritizeTasks(tasks: Task[]): Task[] {
  return tasks
    .map(task => ({
      ...task,
      priorityScore: calculateTaskPriorityScore(task),
    }))
    .sort((a, b) => b.priorityScore - a.priorityScore);
}

/**
 * Calculate task priority score
 */
function calculateTaskPriorityScore(task: Task): number {
  let score = 0;

  // Priority weight
  const priorityWeights = {
    critical: 100,
    high: 75,
    medium: 50,
    low: 25,
  };
  score += priorityWeights[task.priority];

  // Complexity weight (more complex = higher priority for early assignment)
  const complexityWeights = {
    very_complex: 40,
    complex: 30,
    moderate: 20,
    simple: 10,
  };
  score += complexityWeights[task.complexity];

  // Phase weight (earlier phases = higher priority)
  const phaseWeights = {
    planning: 60,
    search: 50,
    screening: 40,
    extraction: 30,
    quality_assessment: 25,
    analysis: 20,
    writing: 10,
  };
  score += phaseWeights[task.phase];

  // Dependency weight (tasks with dependents = higher priority)
  score += task.dependencies.length * 5;

  return score;
}

/**
 * Assign tasks to team members
 */
function assignTasksToTeam(
  tasks: Task[],
  teamMembers: TeamMember[],
  optimizationGoal: string
): TaskAssignment[] {
  const assignments: TaskAssignment[] = [];
  const memberWorkloads = new Map<string, number>();

  // Initialize workloads
  teamMembers.forEach(member => {
    memberWorkloads.set(member.id, member.currentWorkload);
  });

  for (const task of tasks) {
    // Find best team member(s) for this task
    const candidates = teamMembers
      .map(member => ({
        member,
        skillMatch: calculateSkillMatch(task.requiredSkills, member.skills),
        currentLoad: memberWorkloads.get(member.id) || 0,
        availableCapacity: member.availability - (memberWorkloads.get(member.id) || 0),
      }))
      .filter(c => c.availableCapacity > 0 && c.skillMatch > 0)
      .sort((a, b) => {
        if (optimizationGoal === 'maximize_quality') {
          return b.skillMatch - a.skillMatch;
        } else if (optimizationGoal === 'balance_workload') {
          return a.currentLoad - b.currentLoad;
        } else {
          return b.skillMatch * 0.6 + (1 - a.currentLoad / a.member.availability) * 0.4;
        }
      });

    if (candidates.length === 0) {
      // No available team member - flag as bottleneck
      assignments.push({
        task_id: task.id,
        task_name: task.name,
        assigned_to: [],
        estimated_hours: task.estimatedHours,
        start_date: new Date().toISOString(),
        end_date: new Date().toISOString(),
        priority_score: 0,
        skill_match_score: 0,
        rationale: 'No team member available with required skills or capacity',
      });
      continue;
    }

    // Assign to best candidate
    const bestCandidate = candidates[0];
    const assignedMembers = [bestCandidate.member.id];

    // Update workload
    const newWorkload = (memberWorkloads.get(bestCandidate.member.id) || 0) + task.estimatedHours;
    memberWorkloads.set(bestCandidate.member.id, newWorkload);

    // Calculate dates
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + (task.estimatedHours / 8) * 24 * 60 * 60 * 1000);

    assignments.push({
      task_id: task.id,
      task_name: task.name,
      assigned_to: assignedMembers,
      estimated_hours: task.estimatedHours,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      priority_score: calculateTaskPriorityScore(task),
      skill_match_score: bestCandidate.skillMatch,
      rationale: `Assigned to ${bestCandidate.member.name} (${bestCandidate.member.role}) - Skill match: ${Math.round(bestCandidate.skillMatch * 100)}%, Available capacity: ${Math.round(bestCandidate.availableCapacity)}h`,
    });
  }

  return assignments;
}

/**
 * Calculate skill match score
 */
function calculateSkillMatch(requiredSkills: string[], memberSkills: string[]): number {
  if (requiredSkills.length === 0) return 1.0;

  const matchedSkills = requiredSkills.filter(skill =>
    memberSkills.some(ms => ms.toLowerCase().includes(skill.toLowerCase()))
  );

  return matchedSkills.length / requiredSkills.length;
}

/**
 * Calculate workload distribution
 */
function calculateWorkloadDistribution(
  teamMembers: TeamMember[],
  assignments: TaskAssignment[]
): OptimizeResourceAllocationOutput['workload_distribution'] {
  return teamMembers.map(member => {
    const memberAssignments = assignments.filter(a => a.assigned_to.includes(member.id));
    const allocatedHours = memberAssignments.reduce((sum, a) => sum + a.estimated_hours, 0);
    const totalHours = member.currentWorkload + allocatedHours;

    return {
      member_id: member.id,
      member_name: member.name,
      allocated_hours: allocatedHours,
      available_hours: member.availability,
      utilization_percentage: Math.round((totalHours / member.availability) * 100),
      assigned_tasks: memberAssignments.length,
    };
  });
}

/**
 * Estimate project timeline
 */
function estimateTimeline(
  assignments: TaskAssignment[],
  tasks: Task[],
  _projectDeadline?: string
): OptimizeResourceAllocationOutput['timeline'] {
  const startDate = new Date();
  
  // Find critical path (longest sequence of dependent tasks)
  const criticalPath = findCriticalPath(tasks, assignments);
  
  // Calculate total duration based on critical path
  const criticalPathDuration = criticalPath.reduce((sum, taskId) => {
    const task = tasks.find(t => t.id === taskId);
    return sum + (task?.estimatedHours || 0);
  }, 0);

  const durationDays = Math.ceil(criticalPathDuration / 8); // Assuming 8 hours per day
  const completionDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

  return {
    estimated_start: startDate.toISOString().split('T')[0],
    estimated_completion: completionDate.toISOString().split('T')[0],
    total_duration_days: durationDays,
    critical_path: criticalPath,
  };
}

/**
 * Find critical path through task dependencies
 */
function findCriticalPath(tasks: Task[], _assignments: TaskAssignment[]): string[] {
  // Simple critical path: tasks with most dependencies
  const taskDependencyCount = new Map<string, number>();

  tasks.forEach(task => {
    const count = countAllDependencies(task, tasks);
    taskDependencyCount.set(task.id, count);
  });

  return Array.from(taskDependencyCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([taskId]) => taskId);
}

/**
 * Count all dependencies recursively
 */
function countAllDependencies(task: Task, allTasks: Task[]): number {
  let count = task.dependencies.length;

  task.dependencies.forEach(depId => {
    const depTask = allTasks.find(t => t.id === depId);
    if (depTask) {
      count += countAllDependencies(depTask, allTasks);
    }
  });

  return count;
}

/**
 * Identify resource bottlenecks
 */
function identifyBottlenecks(
  _teamMembers: TeamMember[],
  assignments: TaskAssignment[],
  workloadDistribution: OptimizeResourceAllocationOutput['workload_distribution'],
  _timeline: OptimizeResourceAllocationOutput['timeline']
): OptimizeResourceAllocationOutput['bottlenecks'] {
  const bottlenecks: OptimizeResourceAllocationOutput['bottlenecks'] = [];

  // Check for overallocated team members
  workloadDistribution.forEach(dist => {
    if (dist.utilization_percentage > 100) {
      bottlenecks.push({
        type: 'overallocation',
        severity: dist.utilization_percentage > 150 ? 'critical' : 'high',
        description: `${dist.member_name} is overallocated at ${dist.utilization_percentage}% capacity`,
        affected_tasks: assignments
          .filter(a => a.assigned_to.includes(dist.member_id))
          .map(a => a.task_id),
        recommendation: `Redistribute ${dist.allocated_hours - dist.available_hours} hours to other team members or extend timeline`,
      });
    }
  });

  // Check for unassigned tasks
  const unassignedTasks = assignments.filter(a => a.assigned_to.length === 0);
  if (unassignedTasks.length > 0) {
    bottlenecks.push({
      type: 'skill_gap',
      severity: 'critical',
      description: `${unassignedTasks.length} tasks cannot be assigned due to skill gaps or capacity constraints`,
      affected_tasks: unassignedTasks.map(a => a.task_id),
      recommendation: 'Consider hiring additional team members or providing training to existing members',
    });
  }

  // Check for low skill matches
  const lowSkillMatches = assignments.filter(a => a.skill_match_score < 0.5 && a.assigned_to.length > 0);
  if (lowSkillMatches.length > 0) {
    bottlenecks.push({
      type: 'skill_gap',
      severity: 'medium',
      description: `${lowSkillMatches.length} tasks assigned to team members with suboptimal skill match`,
      affected_tasks: lowSkillMatches.map(a => a.task_id),
      recommendation: 'Consider providing additional training or mentorship for these tasks',
    });
  }

  return bottlenecks;
}

/**
 * Generate recommendations
 */
function generateRecommendations(
  _teamMembers: TeamMember[],
  assignments: TaskAssignment[],
  workloadDistribution: OptimizeResourceAllocationOutput['workload_distribution'],
  bottlenecks: OptimizeResourceAllocationOutput['bottlenecks'],
  _optimizationGoal: string
): string[] {
  const recommendations: string[] = [];

  // Workload balance recommendations
  const avgUtilization = workloadDistribution.reduce((sum, d) => sum + d.utilization_percentage, 0) / workloadDistribution.length;
  if (avgUtilization < 60) {
    recommendations.push(`Team is underutilized (${Math.round(avgUtilization)}% average). Consider reducing team size or taking on additional projects.`);
  } else if (avgUtilization > 90) {
    recommendations.push(`Team is highly utilized (${Math.round(avgUtilization)}% average). Consider extending timeline or adding resources.`);
  }

  // Skill gap recommendations
  const skillGapBottlenecks = bottlenecks.filter(b => b.type === 'skill_gap');
  if (skillGapBottlenecks.length > 0) {
    recommendations.push('Identified skill gaps. Recommend training programs or hiring specialists in: systematic review methodology, statistical analysis, or data extraction.');
  }

  // Timeline recommendations
  if (bottlenecks.some(b => b.severity === 'critical')) {
    recommendations.push('Critical bottlenecks detected. Recommend immediate action to prevent project delays.');
  }

  // Quality recommendations
  const lowQualityAssignments = assignments.filter(a => a.skill_match_score < 0.7);
  if (lowQualityAssignments.length > assignments.length * 0.3) {
    recommendations.push('Over 30% of tasks have suboptimal skill matches. Consider reassignment or additional training.');
  }

  return recommendations;
}

/**
 * Calculate quality score
 */
function calculateQualityScore(assignments: TaskAssignment[], _teamMembers: TeamMember[]): number {
  if (assignments.length === 0) return 0;

  const avgSkillMatch = assignments.reduce((sum, a) => sum + a.skill_match_score, 0) / assignments.length;
  const assignmentRate = assignments.filter(a => a.assigned_to.length > 0).length / assignments.length;

  return Math.round((avgSkillMatch * 0.6 + assignmentRate * 0.4) * 100);
}

/**
 * Calculate feasibility score
 */
function calculateFeasibilityScore(
  workloadDistribution: OptimizeResourceAllocationOutput['workload_distribution'],
  bottlenecks: OptimizeResourceAllocationOutput['bottlenecks'],
  timeline: OptimizeResourceAllocationOutput['timeline'],
  projectDeadline?: string
): number {
  let score = 100;

  // Penalize for overallocation
  const overallocated = workloadDistribution.filter(d => d.utilization_percentage > 100);
  score -= overallocated.length * 15;

  // Penalize for critical bottlenecks
  const criticalBottlenecks = bottlenecks.filter(b => b.severity === 'critical');
  score -= criticalBottlenecks.length * 20;

  // Penalize for high severity bottlenecks
  const highBottlenecks = bottlenecks.filter(b => b.severity === 'high');
  score -= highBottlenecks.length * 10;

  // Penalize if deadline is missed
  if (projectDeadline) {
    const deadline = new Date(projectDeadline);
    const completion = new Date(timeline.estimated_completion);
    if (completion > deadline) {
      score -= 25;
    }
  }

  return Math.max(0, Math.min(100, score));
}
