import { auth } from '../firebase';
import { 
  VATReturn, 
  Payment, 
  CorporateTaxReturn, 
  Correspondence, 
  Registration, 
  Document,
  UserProfile
} from '../types';

const API_BASE = '/api';

export const dataService = {
  // VAT Returns
  async getVATReturns(userId?: string): Promise<VATReturn[]> {
    try {
      const url = userId ? `${API_BASE}/vat-returns?userId=${userId}` : `${API_BASE}/vat-returns`;
      const response = await fetch(url);
      const data = await response.json();
      return data.map((item: any) => this.mapFromDb(item));
    } catch (error) {
      console.error('Error fetching VAT returns:', error);
      return [];
    }
  },

  async getVATReturn(id: string): Promise<VATReturn | null> {
    try {
      const response = await fetch(`${API_BASE}/vat-returns/${id}`);
      const data = await response.json();
      return data ? this.mapFromDb(data) : null;
    } catch (error) {
      console.error('Error fetching VAT return:', error);
      return null;
    }
  },

  async saveVATReturn(data: any) {
    try {
      const response = await fetch(`${API_BASE}/vat-returns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          userId: auth.currentUser?.uid
        })
      });
      const result = await response.json();
      return result.id;
    } catch (error) {
      console.error('Error saving VAT return:', error);
      throw error;
    }
  },

  async deleteVATReturn(id: string) {
    try {
      await fetch(`${API_BASE}/vat-returns/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.error('Error deleting VAT return:', error);
      throw error;
    }
  },

  // Payments
  async getPayments(userId?: string): Promise<Payment[]> {
    try {
      const url = userId ? `${API_BASE}/payments?userId=${userId}` : `${API_BASE}/payments`;
      const response = await fetch(url);
      const data = await response.json();
      return data.map((item: any) => this.mapFromDb(item));
    } catch (error) {
      console.error('Error fetching payments:', error);
      return [];
    }
  },

  async savePayment(data: { type: string, amount: number, status: string, dueDate: string }) {
    try {
      const response = await fetch(`${API_BASE}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          userId: auth.currentUser?.uid
        })
      });
      return await response.json();
    } catch (error) {
      console.error('Error saving payment:', error);
      throw error;
    }
  },

  // Registrations
  async getRegistrations(userId?: string): Promise<Registration[]> {
    try {
      const url = userId ? `${API_BASE}/registrations?userId=${userId}` : `${API_BASE}/registrations`;
      const response = await fetch(url);
      const data = await response.json();
      return data.map((item: any) => this.mapFromDb(item));
    } catch (error) {
      console.error('Error fetching registrations:', error);
      return [];
    }
  },

  // Correspondence
  async getCorrespondence(userId?: string): Promise<Correspondence[]> {
    try {
      const url = userId ? `${API_BASE}/correspondence?userId=${userId}` : `${API_BASE}/correspondence`;
      const response = await fetch(url);
      const data = await response.json();
      return data.map((item: any) => this.mapFromDb(item));
    } catch (error) {
      console.error('Error fetching correspondence:', error);
      return [];
    }
  },

  // Documents
  async getDocumentsByVATReturn(vatReturnId: string): Promise<Document[]> {
    try {
      const response = await fetch(`${API_BASE}/documents?vatReturnId=${vatReturnId}`);
      const data = await response.json();
      return data.map((item: any) => this.mapFromDb(item));
    } catch (error) {
      console.error('Error fetching documents:', error);
      return [];
    }
  },

  async downloadDocument(id: string) {
    try {
      const response = await fetch(`${API_BASE}/documents/${id}`);
      const docData = await response.json();
      if (!docData) throw new Error('Document not found');
      
      const link = document.createElement('a');
      link.href = docData.file_data || '';
      link.download = docData.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading document:', error);
      throw error;
    }
  },

  // Corporate Tax
  async getCorporateTaxReturns(userId?: string): Promise<CorporateTaxReturn[]> {
    try {
      const url = userId ? `${API_BASE}/corporate-tax-returns?userId=${userId}` : `${API_BASE}/corporate-tax-returns`;
      const response = await fetch(url);
      const data = await response.json();
      return data.map((item: any) => this.mapFromDb(item));
    } catch (error) {
      console.error('Error fetching corporate tax returns:', error);
      return [];
    }
  },

  async saveCorporateTaxReturn(data: any) {
    try {
      const response = await fetch(`${API_BASE}/corporate-tax-returns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          userId: auth.currentUser?.uid
        })
      });
      const result = await response.json();
      return result.id;
    } catch (error) {
      console.error('Error saving corporate tax return:', error);
      throw error;
    }
  },

  async deleteCorporateTaxReturn(id: string) {
    try {
      await fetch(`${API_BASE}/corporate-tax-returns/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.error('Error deleting corporate tax return:', error);
      throw error;
    }
  },

  async getVATRefunds(userId?: string): Promise<any[]> {
    try {
      const url = userId ? `${API_BASE}/vat-refunds?userId=${userId}` : `${API_BASE}/vat-refunds`;
      const response = await fetch(url);
      const data = await response.json();
      return data.map((item: any) => this.mapFromDb(item));
    } catch (error) {
      console.error('Error fetching VAT refunds:', error);
      return [];
    }
  },

  async saveVATRefund(data: any) {
    try {
      const response = await fetch(`${API_BASE}/vat-refunds`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          userId: auth.currentUser?.uid
        })
      });
      const result = await response.json();
      return result.id;
    } catch (error) {
      console.error('Error saving VAT refund:', error);
      throw error;
    }
  },

  async getDocuments(userId?: string): Promise<Document[]> {
    try {
      const url = userId ? `${API_BASE}/documents?userId=${userId}` : `${API_BASE}/documents`;
      const response = await fetch(url);
      const data = await response.json();
      return data.map((item: any) => this.mapFromDb(item));
    } catch (error) {
      console.error('Error fetching documents:', error);
      return [];
    }
  },

  async uploadDocument(data: { vatReturnId: string, fileName: string, fileType: string, fileData: string }) {
    try {
      const response = await fetch(`${API_BASE}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          userId: auth.currentUser?.uid
        })
      });
      return await response.json();
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  async sendReceipt(data: { amount: number, reference: string, email: string }) {
    console.log('Sending receipt:', data);
    return { success: true };
  },

  // Helper to map snake_case from DB to camelCase for frontend
  mapFromDb(item: any) {
    const mapped: any = {};
    for (const key in item) {
      const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      mapped[camelKey] = item[key];
    }
    return mapped;
  },

  async seedData(): Promise<void> {
    // Seeding logic can be implemented via a dedicated API route if needed
    console.warn('Seed data not yet implemented for AWS RDS backend');
  }
};
