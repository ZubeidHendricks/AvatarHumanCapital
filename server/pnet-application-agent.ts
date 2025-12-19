import { pnetAPIService, type Question, type MandatoryConsent } from './pnet-api-service';
import { groqResearchService } from './groq-service';
import type { Candidate } from '@shared/schema';
import { readFile } from 'fs/promises';
import path from 'path';

/**
 * PNET Application Agent
 * AI-powered agent that automatically applies candidates to PNET jobs
 */

interface ApplicationContext {
  candidate: Candidate;
  jobUrl: string;
  jobTitle?: string;
  jobDescription?: string;
}

export class PNetApplicationAgent {
  /**
   * Main orchestration method: Apply a candidate to a PNET job
   */
  async applyToJob(context: ApplicationContext): Promise<{
    success: boolean;
    message: string;
    pnetApplicationId?: string;
  }> {
    console.log(`[PNetAgent] Starting application for ${context.candidate.fullName} to ${context.jobUrl}`);

    try {
      // Step 1: Check if job is active and get requirements
      const jobInfo = await pnetAPIService.isJobActiveAndReady(context.jobUrl);

      if (!jobInfo.isActive) {
        return {
          success: false,
          message: 'Job is not active on PNET',
        };
      }

      console.log(`[PNetAgent] Job is active. Screening questions: ${jobInfo.screeningQuestions.length}`);

      // Step 2: Prepare CV in base64
      const cvBase64 = await this.prepareCandidateCV(context.candidate);

      // Step 3: AI generates answers to screening questions
      const answers = await this.generateScreeningAnswers(
        context.candidate,
        jobInfo.screeningQuestions,
        context.jobTitle,
        context.jobDescription
      );

      // Step 4: Accept mandatory consents
      const consents = pnetAPIService.acceptAllConsents(
        jobInfo.requiredConsents,
        [],
        false // Don't accept optional marketing consents
      );

      // Step 5: Submit application
      const response = await pnetAPIService.submitApplication(
        {
          Email: context.candidate.email || '',
          FirstName: this.extractFirstName(context.candidate.fullName),
          Surname: this.extractSurname(context.candidate.fullName),
          Mobile: context.candidate.phone || undefined,
          cvBase64,
          cvFileName: `${context.candidate.fullName.replace(/\s+/g, '_')}_CV.pdf`,
          cvFileType: 'pdf',
          Answers: answers,
          Consents: consents,
        },
        context.jobUrl
      );

      if (response.Header.Status === 'OK') {
        return {
          success: true,
          message: 'Application submitted successfully to PNET',
          pnetApplicationId: response.Header.Id,
        };
      } else {
        return {
          success: false,
          message: `PNET error: ${response.Header.ErrorMsg}`,
        };
      }
    } catch (error: any) {
      console.error('[PNetAgent] Application failed:', error);
      return {
        success: false,
        message: `Application failed: ${error.message}`,
      };
    }
  }

  /**
   * AI-powered screening question answering
   * Uses Groq to generate intelligent responses based on candidate profile
   */
  private async generateScreeningAnswers(
    candidate: Candidate,
    questions: Question[],
    jobTitle?: string,
    jobDescription?: string
  ): Promise<Array<{
    QuestionId: string;
    Records: Array<{ Fields: Record<string, string[]> }>;
  }>> {
    if (questions.length === 0) {
      return [];
    }

    console.log(`[PNetAgent] Generating answers for ${questions.length} screening questions using AI`);

    const prompt = `You are an AI recruitment assistant helping a candidate apply to a job on PNET.

CANDIDATE PROFILE:
Name: ${candidate.fullName}
Email: ${candidate.email || 'N/A'}
Phone: ${candidate.phone || 'N/A'}
Current Role: ${(candidate as any).currentRole || 'N/A'}
Skills: ${(candidate as any).skills?.join(', ') || 'N/A'}
Experience: ${(candidate as any).experience || 'N/A'}
Location: ${(candidate as any).location || 'N/A'}

JOB:
Title: ${jobTitle || 'N/A'}
Description: ${jobDescription || 'N/A'}

SCREENING QUESTIONS:
${questions.map((q, i) => `
Question ${i + 1} (ID: ${q.Id}):
Label: ${q.Label || 'N/A'}
${q.Fields.map(f => `
  Field ID: ${f.Id}
  Type: ${f.Type}
  Label: ${f.Label || q.Label || 'N/A'}
  Required: ${f.Required}
  ${f.Values ? `Options: ${f.Values.map(v => `${v.Id}="${v.Label}"`).join(', ')}` : ''}
`).join('\n')}
`).join('\n')}

Generate intelligent, truthful answers for each question based on the candidate's profile.

INSTRUCTIONS:
- For INPUT_TEXT/TEXTAREA: Provide concise, relevant text answers
- For INPUT_INT: Provide numeric values (e.g., salary expectations, years of experience)
- For DATE: Use YYYY-MM-DD format
- For DATE_RANGE: Use {From: "YYYY-MM-DD", To: "YYYY-MM-DD"}
- For SINGLE_SELECT/RADIO: Choose the MOST RELEVANT option ID
- For MULTI_SELECT: Choose relevant option IDs (max 3)
- For CHECKBOX: Return the option ID if applicable
- For HYPERLINK: Provide a URL if candidate has one
- For FILE/INFORMATION: Skip these
- Be honest - if candidate doesn't match, be truthful but positive

Return ONLY valid JSON in this EXACT format:
{
  "answers": [
    {
      "questionId": "<Question.Id>",
      "fieldId": "<Field.Id>",
      "answer": "<string value or option ID>",
      "type": "<Field.Type>"
    }
  ]
}`;

    try {
      const aiResponse = await groqResearchService.chat([
        { role: 'system', content: 'You are an expert recruitment AI that helps candidates apply to jobs.' },
        { role: 'user', content: prompt }
      ]);

      const parsed = JSON.parse(aiResponse);
      
      // Convert AI response to PNET format
      const answersMap = new Map<string, Map<string, string[]>>();

      for (const answer of parsed.answers) {
        if (!answersMap.has(answer.questionId)) {
          answersMap.set(answer.questionId, new Map());
        }
        const fieldsMap = answersMap.get(answer.questionId)!;
        
        // Handle different answer types
        let answerValue: string[];
        if (answer.type === 'DATE_RANGE' && typeof answer.answer === 'object') {
          answerValue = [JSON.stringify(answer.answer)];
        } else if (Array.isArray(answer.answer)) {
          answerValue = answer.answer;
        } else {
          answerValue = [String(answer.answer)];
        }
        
        fieldsMap.set(answer.fieldId, answerValue);
      }

      // Convert to PNET format
      const pnetAnswers = Array.from(answersMap.entries()).map(([questionId, fieldsMap]) => ({
        QuestionId: questionId,
        Records: [{
          Fields: Object.fromEntries(fieldsMap),
        }],
      }));

      console.log(`[PNetAgent] Generated ${pnetAnswers.length} answers`);
      return pnetAnswers;

    } catch (error) {
      console.error('[PNetAgent] Failed to generate screening answers:', error);
      // Return empty answers rather than failing the entire application
      return [];
    }
  }

  /**
   * Prepare candidate CV as base64
   * TODO: Replace with actual CV retrieval from your system
   */
  private async prepareCandidateCV(candidate: Candidate): Promise<string> {
    // Option 1: If CV is stored in database as file path
    if ((candidate as any).cvPath) {
      const cvPath = path.join(process.cwd(), 'uploads', (candidate as any).cvPath);
      try {
        const buffer = await readFile(cvPath);
        return buffer.toString('base64');
      } catch (error) {
        console.warn('[PNetAgent] Could not read CV file, generating placeholder');
      }
    }

    // Option 2: Generate a simple text CV as fallback
    const textCV = this.generateTextCV(candidate);
    return Buffer.from(textCV, 'utf-8').toString('base64');
  }

  /**
   * Generate a simple text CV from candidate data
   */
  private generateTextCV(candidate: Candidate): string {
    return `
${candidate.fullName}
${candidate.email || ''}
${candidate.phone || ''}

PROFESSIONAL SUMMARY
${(candidate as any).experience || 'Experienced professional seeking new opportunities'}

SKILLS
${(candidate as any).skills?.join(', ') || 'N/A'}

CURRENT ROLE
${(candidate as any).currentRole || 'N/A'}

LOCATION
${(candidate as any).location || 'N/A'}
`.trim();
  }

  /**
   * Extract first name from full name
   */
  private extractFirstName(fullName: string): string {
    return fullName.split(' ')[0] || fullName;
  }

  /**
   * Extract surname from full name
   */
  private extractSurname(fullName: string): string {
    const parts = fullName.split(' ');
    return parts.length > 1 ? parts[parts.length - 1] : '';
  }

  /**
   * Bulk apply multiple candidates to a PNET job
   */
  async bulkApply(
    candidates: Candidate[],
    jobUrl: string,
    jobTitle?: string,
    jobDescription?: string
  ): Promise<{
    total: number;
    successful: number;
    failed: number;
    results: Array<{
      candidateId: string;
      candidateName: string;
      success: boolean;
      message: string;
    }>;
  }> {
    console.log(`[PNetAgent] Bulk applying ${candidates.length} candidates to ${jobUrl}`);

    const results = [];
    let successful = 0;
    let failed = 0;

    for (const candidate of candidates) {
      const result = await this.applyToJob({
        candidate,
        jobUrl,
        jobTitle,
        jobDescription,
      });

      results.push({
        candidateId: candidate.id,
        candidateName: candidate.fullName,
        success: result.success,
        message: result.message,
      });

      if (result.success) {
        successful++;
      } else {
        failed++;
      }

      // Rate limiting: Wait 2 seconds between applications
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return {
      total: candidates.length,
      successful,
      failed,
      results,
    };
  }
}

// Export singleton instance
export const pnetApplicationAgent = new PNetApplicationAgent();
