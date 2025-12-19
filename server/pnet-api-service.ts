import axios, { AxiosInstance } from 'axios';
import { randomUUID } from 'crypto';

/**
 * PNET ATSi Apply API V4 Service
 * Enables AI agents to interact with PNET for job posting and application submission
 */

// ========== TYPES FROM PNET API SPEC ==========

export interface PNetInquiryRequest {
  Header: {
    Id: string; // UUID
    JobBoardId: 'pnet_co_za';
    JobBoardName?: 'PNet';
    OriginalUrl: string;
    EffectiveUrl: string;
    AtsJobId?: string;
  };
}

export type QuestionFieldType = 
  | 'INPUT_TEXT'
  | 'INPUT_INT'
  | 'TEXTAREA'
  | 'DATE'
  | 'DATE_RANGE'
  | 'SINGLE_SELECT'
  | 'MULTI_SELECT'
  | 'RADIO'
  | 'CHECKBOX'
  | 'FILE'
  | 'HYPERLINK'
  | 'INFORMATION';

export interface QuestionField {
  Id: string;
  Label?: string;
  Type: QuestionFieldType;
  Required: boolean;
  Values?: Array<{ Id: string; Label: string }>;
  Validations?: Array<{
    Id: string;
    Parameters?: Record<string, any>;
  }>;
  VisibleFor?: {
    FieldId: string;
    Values: string[];
  };
}

export interface Question {
  Id: string;
  Label?: string;
  Repeatable: boolean;
  VisibleFor?: {
    QuestionId: string;
    FieldId: string;
    Values: string[];
  };
  Fields: QuestionField[];
}

export interface BasicDataField {
  Name: 'FirstName' | 'Surname' | 'Email' | 'Mobile' | 'Gender' | 'CV' | 'CoverLetter' | 'AdditionalDocuments';
  Visibility: 'REQUIRED' | 'OPTIONAL' | 'UNSUPPORTED';
  Validations?: Array<{
    Id: string;
    Parameters?: Record<string, any>;
  }>;
}

export interface MandatoryConsent {
  Id: string;
  OrgName: string;
  DocumentType: 'PRIVACY_POLICY' | 'TERMS_AND_CONDITIONS';
  Url: string;
}

export interface OptionalConsent {
  Id: string;
  Content: string;
  ConsentType: 'TEXT' | 'TEXT_WITH_LINK';
  LinkName?: string;
  Url?: string;
}

export interface PNetInquiryResponse {
  Header: {
    Id: string;
    Status: 'OK' | 'ERROR';
    ErrorMsg?: string;
    ErrorDesc?: string;
  };
  Body?: {
    JobStatus: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
    AtsJobId?: string;
    BasicData?: BasicDataField[];
    Questions?: Question[];
    Consents?: {
      Mandatory?: MandatoryConsent[];
      Optional?: OptionalConsent[];
    };
  };
}

export interface PNetApplyRequest {
  Header: {
    Id: string;
    JobBoardId: 'pnet_co_za';
    OriginalUrl: string;
    EffectiveUrl: string;
  };
  Body: {
    Email: string;
    CV: {
      BinaryData: string; // Base64
      FileType: 'doc' | 'docx' | 'pdf' | 'txt' | 'rtf' | 'odt';
      FileName?: string;
    };
    FirstName?: string;
    Surname?: string;
    Mobile?: string;
    Telephone?: string;
    BirthDate?: string; // YYYY-MM-DD
    Gender?: 'MALE' | 'FEMALE' | 'OTHER';
    PrimaryLanguage?: string;
    Nationality?: string;
    Address?: {
      StreetName?: string;
      BuildingNumber?: string;
      Unit?: string;
      PostalCode?: string;
      City?: string;
      Country?: string;
      CountryCode?: string; // ISO 3166-1 alpha-2
    };
    CoverLetter?: {
      BinaryData: string;
      FileType: 'doc' | 'docx' | 'pdf' | 'txt';
      FileName?: string;
    };
    AdditionalDocuments?: Array<{
      BinaryData: string;
      FileType: string;
      FileName?: string;
    }>;
    Answers?: Array<{
      QuestionId: string;
      Records: Array<{
        Fields: Record<string, string[]>;
      }>;
    }>;
    EmploymentHistory?: {
      CurrentEmployer?: string;
      Items?: Array<{
        EmployerOrganizationName?: string;
        EmploymentSummary?: string;
        Current?: boolean;
        PositionHistory?: Array<{
          OrganizationName?: string;
          Title?: string;
          Location?: string;
          Period?: {
            Start?: string;
            End?: string;
          };
        }>;
      }>;
    };
    Education?: {
      HighestDegree?: {
        DegreeType?: string;
        FieldOfStudy?: string;
      };
      Items?: Array<{
        SchoolType?: string;
        SchoolName?: string;
        DegreeName?: string;
        DegreeType?: string;
        StartDate?: string;
        EndDate?: string;
        Major?: string;
      }>;
    };
    Qualifications?: Array<{
      GroupName?: string;
      Competencies?: Array<{
        Name?: string;
      }>;
    }>;
    Consents?: {
      Mandatory?: Array<{
        Id: string;
        OrgName: string;
        Url: string;
        DocumentType: 'PRIVACY_POLICY' | 'TERMS_AND_CONDITIONS';
        Accepted: 'YES' | 'NO';
      }>;
      Optional?: Array<{
        Id: string;
        Content: string;
        ConsentType: 'TEXT' | 'TEXT_WITH_LINK';
        LinkName?: string;
        Url?: string;
        Accepted: 'YES' | 'NO';
      }>;
    };
  };
}

export interface PNetApplyResponse {
  Header: {
    Id: string;
    Status: 'OK' | 'ERROR';
    ErrorMsg?: string;
    ErrorDesc?: string;
  };
  Body: {
    Redirect: 'YES' | 'NO';
    BackUrl?: string;
  };
}

// ========== PNET API CLIENT ==========

export class PNetAPIService {
  private client: AxiosInstance;
  private apiKey: string;
  private baseUrl: string;
  private orgId: string;
  private senderId: string;

  constructor(
    baseUrl?: string,
    apiKey?: string,
    orgId?: string,
    senderId?: string
  ) {
    this.baseUrl = baseUrl || process.env.PNET_API_BASE_URL || '';
    this.apiKey = apiKey || process.env.PNET_API_KEY || '';
    this.orgId = orgId || process.env.PNET_ORG_ID || '120911';
    this.senderId = senderId || process.env.PNET_SENDER_ID || '21965';

    if (!this.apiKey) {
      console.warn('[PNetAPIService] WARNING: PNET_API_KEY not configured. API calls will fail.');
    }

    console.log(`[PNetAPIService] Configured with Org ID: ${this.orgId}, Sender ID: ${this.senderId}`);

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'apiKey': this.apiKey,
        'X-Org-Id': this.orgId,
        'X-Sender-Id': this.senderId,
      },
      timeout: 30000,
    });
  }

  /**
   * Check if a job is active on PNET and get application requirements
   * Used by AI agents before submitting applications
   */
  async inquireJob(
    originalUrl: string,
    effectiveUrl?: string,
    atsJobId?: string
  ): Promise<PNetInquiryResponse> {
    const requestId = randomUUID();
    
    const request: PNetInquiryRequest = {
      Header: {
        Id: requestId,
        JobBoardId: 'pnet_co_za',
        JobBoardName: 'PNet',
        OriginalUrl: originalUrl,
        EffectiveUrl: effectiveUrl || originalUrl,
        AtsJobId: atsJobId,
      },
    };

    console.log(`[PNetAPIService] Inquiry for job: ${originalUrl} (Org: ${this.orgId}, Sender: ${this.senderId})`);

    try {
      const response = await this.client.post<PNetInquiryResponse>('/inquiry', request);
      
      if (response.data.Header.Status === 'ERROR') {
        console.error(`[PNetAPIService] Inquiry error: ${response.data.Header.ErrorMsg}`);
      } else {
        console.log(`[PNetAPIService] Job status: ${response.data.Body?.JobStatus}`);
      }

      return response.data;
    } catch (error: any) {
      console.error('[PNetAPIService] Inquiry failed:', error.message);
      throw new Error(`PNET inquiry failed: ${error.message}`);
    }
  }

  /**
   * Submit a candidate application to PNET
   * Used by AI agents to apply candidates to jobs
   */
  async submitApplication(
    applicationData: Omit<PNetApplyRequest['Body'], 'CV'> & {
      cvBase64: string;
      cvFileName: string;
      cvFileType: 'doc' | 'docx' | 'pdf' | 'txt' | 'rtf' | 'odt';
    },
    originalUrl: string,
    effectiveUrl?: string
  ): Promise<PNetApplyResponse> {
    const requestId = randomUUID();

    const { cvBase64, cvFileName, cvFileType, ...restData } = applicationData;

    const request: PNetApplyRequest = {
      Header: {
        Id: requestId,
        JobBoardId: 'pnet_co_za',
        OriginalUrl: originalUrl,
        EffectiveUrl: effectiveUrl || originalUrl,
      },
      Body: {
        ...restData,
        CV: {
          BinaryData: cvBase64,
          FileType: cvFileType,
          FileName: cvFileName,
        },
      },
    };

    console.log(`[PNetAPIService] Submitting application for: ${applicationData.Email}`);

    try {
      const response = await this.client.post<PNetApplyResponse>('/apply', request);
      
      if (response.data.Header.Status === 'ERROR') {
        console.error(`[PNetAPIService] Application error: ${response.data.Header.ErrorMsg}`);
      } else {
        console.log(`[PNetAPIService] Application submitted successfully`);
      }

      return response.data;
    } catch (error: any) {
      console.error('[PNetAPIService] Application submission failed:', error.message);
      throw new Error(`PNET application failed: ${error.message}`);
    }
  }

  /**
   * AI Agent Helper: Check if job is suitable for application
   */
  async isJobActiveAndReady(jobUrl: string): Promise<{
    isActive: boolean;
    hasScreeningQuestions: boolean;
    requiredConsents: MandatoryConsent[];
    screeningQuestions: Question[];
  }> {
    const inquiry = await this.inquireJob(jobUrl);

    if (inquiry.Header.Status === 'ERROR' || !inquiry.Body) {
      return {
        isActive: false,
        hasScreeningQuestions: false,
        requiredConsents: [],
        screeningQuestions: [],
      };
    }

    return {
      isActive: inquiry.Body.JobStatus === 'ACTIVE',
      hasScreeningQuestions: (inquiry.Body.Questions?.length || 0) > 0,
      requiredConsents: inquiry.Body.Consents?.Mandatory || [],
      screeningQuestions: inquiry.Body.Questions || [],
    };
  }

  /**
   * AI Agent Helper: Build answers for screening questions
   * AI agents can use this to structure their responses
   */
  buildAnswers(questionsAndAnswers: Array<{
    questionId: string;
    fieldAnswers: Record<string, string | string[]>;
  }>): PNetApplyRequest['Body']['Answers'] {
    return questionsAndAnswers.map(qa => ({
      QuestionId: qa.questionId,
      Records: [{
        Fields: Object.entries(qa.fieldAnswers).reduce((acc, [fieldId, answer]) => {
          acc[fieldId] = Array.isArray(answer) ? answer : [answer];
          return acc;
        }, {} as Record<string, string[]>),
      }],
    }));
  }

  /**
   * AI Agent Helper: Accept all mandatory consents
   */
  acceptAllConsents(
    mandatoryConsents: MandatoryConsent[],
    optionalConsents: OptionalConsent[] = [],
    acceptOptional: boolean = false
  ): PNetApplyRequest['Body']['Consents'] {
    return {
      Mandatory: mandatoryConsents.map(c => ({
        ...c,
        Accepted: 'YES' as const,
      })),
      Optional: optionalConsents.map(c => ({
        ...c,
        Accepted: (acceptOptional ? 'YES' : 'NO') as const,
      })),
    };
  }

  /**
   * AI Agent Helper: Convert file buffer to base64
   */
  fileToBase64(buffer: Buffer): string {
    return buffer.toString('base64');
  }

  /**
   * AI Agent Helper: Read file from filesystem and convert to base64
   */
  async readFileAsBase64(filePath: string): Promise<string> {
    const fs = await import('fs/promises');
    const buffer = await fs.readFile(filePath);
    return this.fileToBase64(buffer);
  }
}

// Export singleton instance
export const pnetAPIService = new PNetAPIService();
