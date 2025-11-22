import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Embedding Service for Job Requirements
 * Generates vector embeddings from job descriptions for RAG-based candidate matching
 */
export class EmbeddingService {
  /**
   * Generate embedding for job requirements
   * Combines all job details into a comprehensive text representation for embedding
   */
  async generateJobEmbedding(jobData: {
    title: string;
    department: string;
    description?: string | null;
    location?: string | null;
    employmentType?: string | null;
    shiftStructure?: string | null;
    minYearsExperience?: number | null;
    licenseRequirements?: string[] | null;
    vehicleTypes?: string[] | null;
    certificationsRequired?: string[] | null;
    physicalRequirements?: string | null;
    equipmentExperience?: any;
    salaryMin?: number | null;
    salaryMax?: number | null;
    payRateUnit?: string | null;
  }): Promise<number[]> {
    try {
      // Construct comprehensive job requirements text
      const requirementsText = this.buildRequirementsText(jobData);

      console.log(`Generating embedding for job: ${jobData.title}`);
      console.log(`Requirements text (${requirementsText.length} chars):`, requirementsText.substring(0, 200) + '...');

      // Use Groq's LLaMA model to generate embeddings
      // Note: Groq doesn't have a native embedding model, so we'll use OpenAI's embedding API
      // For now, we'll return a placeholder - in production, you should use OpenAI's text-embedding-3-small
      
      // TODO: Replace with actual OpenAI embedding API call
      // const response = await fetch('https://api.openai.com/v1/embeddings', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     model: 'text-embedding-3-small',
      //     input: requirementsText,
      //     dimensions: 1536,
      //   }),
      // });
      // const data = await response.json();
      // return data.data[0].embedding;

      // For demonstration purposes, return a zero vector
      // In production, this should call OpenAI's embedding API
      console.warn("WARNING: Using placeholder embedding. Configure OPENAI_API_KEY for actual embeddings.");
      return new Array(1536).fill(0);
    } catch (error) {
      console.error("Error generating job embedding:", error);
      throw new Error(`Failed to generate job embedding: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Build comprehensive text representation of job requirements
   */
  private buildRequirementsText(jobData: {
    title: string;
    department: string;
    description?: string | null;
    location?: string | null;
    employmentType?: string | null;
    shiftStructure?: string | null;
    minYearsExperience?: number | null;
    licenseRequirements?: string[] | null;
    vehicleTypes?: string[] | null;
    certificationsRequired?: string[] | null;
    physicalRequirements?: string | null;
    equipmentExperience?: any;
    salaryMin?: number | null;
    salaryMax?: number | null;
    payRateUnit?: string | null;
  }): string {
    const parts: string[] = [];

    // Job Title and Department
    parts.push(`Job Title: ${jobData.title}`);
    parts.push(`Department: ${jobData.department}`);

    // Description
    if (jobData.description) {
      parts.push(`\nJob Description:\n${jobData.description}`);
    }

    // Location and Type
    if (jobData.location) parts.push(`\nLocation: ${jobData.location}`);
    if (jobData.employmentType) parts.push(`Employment Type: ${jobData.employmentType}`);
    if (jobData.shiftStructure) parts.push(`Shift: ${jobData.shiftStructure}`);

    // Experience
    if (jobData.minYearsExperience) {
      parts.push(`\nMinimum Experience: ${jobData.minYearsExperience} years`);
    }

    // Licenses and Certifications
    if (jobData.licenseRequirements && jobData.licenseRequirements.length > 0) {
      parts.push(`\nRequired Licenses: ${jobData.licenseRequirements.join(', ')}`);
    }

    if (jobData.vehicleTypes && jobData.vehicleTypes.length > 0) {
      parts.push(`Vehicle Types: ${jobData.vehicleTypes.join(', ')}`);
    }

    if (jobData.certificationsRequired && jobData.certificationsRequired.length > 0) {
      parts.push(`Required Certifications: ${jobData.certificationsRequired.join(', ')}`);
    }

    // Physical Requirements
    if (jobData.physicalRequirements) {
      parts.push(`\nPhysical Requirements: ${jobData.physicalRequirements}`);
    }

    // Equipment Experience
    if (jobData.equipmentExperience) {
      const equipment = Object.entries(jobData.equipmentExperience)
        .map(([name, level]) => `${name} (${level})`)
        .join(', ');
      if (equipment) {
        parts.push(`Equipment Experience: ${equipment}`);
      }
    }

    // Compensation
    if (jobData.salaryMin || jobData.salaryMax) {
      const salaryRange = `R${jobData.salaryMin || 0} - R${jobData.salaryMax || 0}`;
      const unit = jobData.payRateUnit || 'monthly';
      parts.push(`\nCompensation: ${salaryRange} ${unit}`);
    }

    return parts.join('\n');
  }

  /**
   * Calculate similarity score between job embedding and candidate resume embedding
   * @returns Similarity score from 0-100
   */
  calculateSimilarity(jobEmbedding: number[], candidateEmbedding: number[]): number {
    if (!jobEmbedding || !candidateEmbedding || jobEmbedding.length !== candidateEmbedding.length) {
      return 0;
    }

    // Calculate cosine similarity
    let dotProduct = 0;
    let jobMagnitude = 0;
    let candidateMagnitude = 0;

    for (let i = 0; i < jobEmbedding.length; i++) {
      dotProduct += jobEmbedding[i] * candidateEmbedding[i];
      jobMagnitude += jobEmbedding[i] * jobEmbedding[i];
      candidateMagnitude += candidateEmbedding[i] * candidateEmbedding[i];
    }

    jobMagnitude = Math.sqrt(jobMagnitude);
    candidateMagnitude = Math.sqrt(candidateMagnitude);

    if (jobMagnitude === 0 || candidateMagnitude === 0) {
      return 0;
    }

    const similarity = dotProduct / (jobMagnitude * candidateMagnitude);
    
    // Convert from -1 to 1 range to 0-100 percentage
    return Math.round(((similarity + 1) / 2) * 100);
  }
}

export const embeddingService = new EmbeddingService();
