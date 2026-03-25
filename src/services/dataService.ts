import { VATReturn, CorporateTaxReturn, Correspondence, Payment, Registration, Document } from '../types';

export const dataService = {
  async getVATReturns(): Promise<VATReturn[]> {
    const response = await fetch('/api/vat_returns');
    if (!response.ok) return [];
    return response.json();
  },

  async getVATReturn(id: string): Promise<VATReturn | null> {
    const response = await fetch(`/api/vat_returns/${id}`);
    if (!response.ok) return null;
    return response.json();
  },

  async saveVATReturn(data: any) {
    const method = data.id ? 'PUT' : 'POST';
    const url = data.id ? `/api/vat_returns/${data.id}` : '/api/vat_returns';
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) throw new Error('Failed to save VAT return');
    const result = await response.json();
    return result.id || data.id;
  },

  async deleteVATReturn(id: string) {
    const response = await fetch(`/api/vat_returns/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete VAT return');
  },

  async getPayments(): Promise<Payment[]> {
    const response = await fetch('/api/payments');
    if (!response.ok) return [];
    return response.json();
  },

  async savePayment(data: { type: string, amount: number, status: string, dueDate: string }) {
    const response = await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create payment');
    return response.json();
  },

  async updatePaymentStatus(id: string, status: string) {
    const response = await fetch(`/api/payments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error('Failed to update payment status');
    return response.json();
  },

  async getCorporateTaxReturns(): Promise<CorporateTaxReturn[]> {
    const response = await fetch('/api/corporate_tax_returns');
    if (!response.ok) return [];
    return response.json();
  },

  async saveCorporateTaxReturn(data: any) {
    const response = await fetch('/api/corporate_tax_returns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) throw new Error('Failed to save corporate tax return');
    const result = await response.json();
    return result.id;
  },

  async deleteCorporateTaxReturn(id: string) {
    const response = await fetch(`/api/corporate_tax_returns/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete corporate tax return');
  },

  async getVATRefunds(): Promise<any[]> {
    // Note: VAT refunds are not yet implemented in server.ts, returning empty for now
    return [];
  },

  async getCorrespondence(): Promise<Correspondence[]> {
    const response = await fetch('/api/correspondence');
    if (!response.ok) return [];
    return response.json();
  },

  async getRegistrations(): Promise<Registration[]> {
    const response = await fetch('/api/registrations');
    if (!response.ok) return [];
    return response.json();
  },

  async getDocuments(): Promise<Document[]> {
    const response = await fetch('/api/documents');
    if (!response.ok) return [];
    return response.json();
  },

  async getDocumentsByVATReturn(vatReturnId: string): Promise<Document[]> {
    const response = await fetch(`/api/documents/${vatReturnId}`);
    if (!response.ok) return [];
    return response.json();
  },

  async uploadDocument(data: { vatReturnId: string, fileName: string, fileType: string, fileData: string }) {
    const response = await fetch('/api/documents/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to upload document');
    return response.json();
  },

  async downloadDocument(id: string) {
    const response = await fetch(`/api/documents/download/${id}`);
    if (!response.ok) throw new Error('Failed to download document');
    const doc = await response.json();
    
    // Create a link and trigger download
    const link = document.createElement('a');
    link.href = doc.fileData;
    link.download = doc.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  async sendReceipt(data: { amount: number, reference: string, email: string }) {
    const response = await fetch('/api/send-receipt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to send receipt');
    return response.json();
  }
};
