import { storage } from "./storage";
import type { 
  WhatsappConversation, 
  WhatsappMessage, 
  InsertWhatsappMessage,
  InsertWhatsappConversation,
  InsertWhatsappDocumentRequest,
  InsertWhatsappAppointment
} from "@shared/schema";

const WHATSAPP_API_URL = "https://graph.facebook.com/v18.0";

interface WhatsappApiResponse {
  messaging_product: string;
  contacts?: { input: string; wa_id: string }[];
  messages?: { id: string }[];
  error?: { message: string; code: number };
}

export class WhatsAppService {
  private token: string | undefined;
  private phoneNumberId: string | undefined;

  constructor() {
    this.token = process.env.WHATSAPP_API_TOKEN;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  }

  isConfigured(): boolean {
    return !!(this.token && this.phoneNumberId);
  }

  async sendTextMessage(
    tenantId: string,
    conversationId: string,
    phone: string,
    body: string,
    senderType: "ai" | "human" = "human",
    senderId?: string
  ): Promise<WhatsappMessage | null> {
    let whatsappMessageId: string | undefined;
    let status: "sent" | "pending" | "failed" = "pending";
    let apiError: string | undefined;

    // Try to send via WhatsApp API if configured
    if (this.isConfigured()) {
      try {
        const response = await fetch(
          `${WHATSAPP_API_URL}/${this.phoneNumberId}/messages`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${this.token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to: phone,
              type: "text",
              text: { body },
            }),
          }
        );

        const data: WhatsappApiResponse = await response.json();

        if (response.ok && !data.error) {
          whatsappMessageId = data.messages?.[0]?.id;
          status = "sent";
        } else {
          apiError = data.error?.message || "Failed to send message";
          status = "failed";
          console.warn("WhatsApp API error:", apiError);
        }
      } catch (error: any) {
        apiError = error.message;
        status = "failed";
        console.warn("WhatsApp API request failed:", error.message);
      }
    } else {
      console.warn("WhatsApp API not configured - storing message locally");
    }

    // Always store the message locally
    const message = await storage.createWhatsappMessage(tenantId, {
      conversationId,
      whatsappMessageId,
      direction: "outbound",
      senderType,
      senderId,
      messageType: "text",
      body,
      status,
      sentAt: new Date(),
      payload: apiError ? { error: apiError } : undefined,
    });

    await storage.updateWhatsappConversation(tenantId, conversationId, {
      lastMessageAt: new Date(),
      lastMessagePreview: body.substring(0, 100),
    });

    return message;
  }

  async sendDocumentRequest(
    tenantId: string,
    conversationId: string,
    phone: string,
    documentType: string,
    documentName: string,
    description?: string,
    dueDate?: Date
  ): Promise<{ message: WhatsappMessage | null; request: any }> {
    const requestBody = `Hello! We need you to submit the following document:\n\n📄 *${documentName}*\n${description ? `\n${description}` : ""}\n${dueDate ? `\n⏰ Please submit by: ${dueDate.toLocaleDateString()}` : ""}\n\nPlease reply to this message with a photo or document file.\n\nThank you!`;

    const message = await this.sendTextMessage(
      tenantId,
      conversationId,
      phone,
      requestBody,
      "ai"
    );

    const request = await storage.createWhatsappDocumentRequest(tenantId, {
      conversationId,
      documentType,
      documentName,
      description,
      status: "requested",
      dueDate,
      messageId: message?.id,
    });

    return { message, request };
  }

  async sendAppointmentRequest(
    tenantId: string,
    conversationId: string,
    phone: string,
    appointmentType: string,
    title: string,
    scheduledAt: Date,
    duration: number,
    location?: string,
    description?: string
  ): Promise<{ message: WhatsappMessage | null; appointment: any }> {
    const timeStr = scheduledAt.toLocaleString("en-ZA", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const requestBody = `Hello! You have been scheduled for:\n\n📅 *${title}*\n\n🕐 *Date & Time:* ${timeStr}\n⏱️ *Duration:* ${duration} minutes\n${location ? `📍 *Location:* ${location}` : ""}\n${description ? `\n${description}` : ""}\n\nPlease reply with:\n✅ CONFIRM - to confirm your attendance\n🔄 RESCHEDULE - to request a different time\n❌ CANCEL - to cancel\n\nThank you!`;

    const message = await this.sendTextMessage(
      tenantId,
      conversationId,
      phone,
      requestBody,
      "ai"
    );

    const appointment = await storage.createWhatsappAppointment(tenantId, {
      conversationId,
      appointmentType,
      title,
      description,
      scheduledAt,
      duration,
      location,
      status: "proposed",
      messageId: message?.id,
    });

    return { message, appointment };
  }

  async getOrCreateConversation(
    tenantId: string,
    phone: string,
    waId: string,
    profileName?: string,
    candidateId?: string,
    type: string = "general"
  ): Promise<WhatsappConversation> {
    let conversation = await storage.getWhatsappConversationByWaId(tenantId, waId);

    if (!conversation) {
      conversation = await storage.createWhatsappConversation(tenantId, {
        waId,
        phone,
        profileName,
        candidateId,
        type,
        status: "active",
      });
    }

    return conversation;
  }

  async processIncomingMessage(
    tenantId: string,
    waId: string,
    phone: string,
    profileName: string | undefined,
    messageData: any
  ): Promise<WhatsappMessage> {
    const conversation = await this.getOrCreateConversation(
      tenantId,
      phone,
      waId,
      profileName
    );

    const messageType = messageData.type || "text";
    let body = "";
    let mediaUrl = "";
    let mediaType = "";

    switch (messageType) {
      case "text":
        body = messageData.text?.body || "";
        break;
      case "image":
        mediaUrl = messageData.image?.link || "";
        mediaType = messageData.image?.mime_type || "image/jpeg";
        body = messageData.image?.caption || "[Image]";
        break;
      case "document":
        mediaUrl = messageData.document?.link || "";
        mediaType = messageData.document?.mime_type || "";
        body = messageData.document?.filename || "[Document]";
        break;
      case "audio":
        mediaUrl = messageData.audio?.link || "";
        mediaType = messageData.audio?.mime_type || "audio/ogg";
        body = "[Voice Message]";
        break;
      case "video":
        mediaUrl = messageData.video?.link || "";
        mediaType = messageData.video?.mime_type || "video/mp4";
        body = messageData.video?.caption || "[Video]";
        break;
      default:
        body = `[${messageType}]`;
    }

    const message = await storage.createWhatsappMessage(tenantId, {
      conversationId: conversation.id,
      whatsappMessageId: messageData.id,
      direction: "inbound",
      senderType: "candidate",
      messageType,
      body,
      mediaUrl: mediaUrl || undefined,
      mediaType: mediaType || undefined,
      status: "delivered",
      payload: messageData,
    });

    await storage.updateWhatsappConversation(tenantId, conversation.id, {
      lastMessageAt: new Date(),
      lastMessagePreview: body.substring(0, 100),
      unreadCount: (conversation.unreadCount || 0) + 1,
    });

    return message;
  }

  async updateMessageStatus(
    tenantId: string,
    whatsappMessageId: string,
    status: string,
    timestamp?: Date
  ): Promise<void> {
    const message = await storage.getWhatsappMessageByWhatsappId(tenantId, whatsappMessageId);
    if (!message) return;

    const updates: Partial<InsertWhatsappMessage> = { status };
    
    switch (status) {
      case "delivered":
        updates.deliveredAt = timestamp || new Date();
        break;
      case "read":
        updates.readAt = timestamp || new Date();
        break;
      case "failed":
        break;
    }

    await storage.updateWhatsappMessage(tenantId, message.id, updates);
  }

  generateCallLink(phone: string): string {
    const cleanPhone = phone.replace(/\D/g, "");
    return `https://wa.me/${cleanPhone}`;
  }
}

export const whatsappService = new WhatsAppService();
