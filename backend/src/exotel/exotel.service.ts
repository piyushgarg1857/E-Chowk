import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ExotelService {
  private readonly logger = new Logger(ExotelService.name);
  private readonly accountSid = process.env.EXOTEL_ACCOUNT_SID || 'echowk1';
  private readonly apiKey = process.env.EXOTEL_API_KEY || '47e333a4354dd025f74c4ac6ce53501dc797d9efc6e09193';
  private readonly apiToken = process.env.EXOTEL_API_TOKEN || 'aeceb9fbc7675c63c4e124dd8ac14d43c9efb2a02c4a76ca';
  private readonly subdomain = process.env.EXOTEL_SUBDOMAIN || 'api.exotel.com';

  private get authHeader(): string {
    const credentials = this.apiKey + ':' + this.apiToken;
    return 'Basic ' + Buffer.from(credentials).toString('base64');
  }

  private get baseUrl(): string {
    return 'https://' + this.subdomain + '/v1/Accounts/' + this.accountSid;
  }

  async connectCall(params: { from: string; to?: string; callerId?: string; url?: string }): Promise<any> {
    const endpoint = this.baseUrl + '/Calls/connect.json';
    const formParams = new URLSearchParams();

    formParams.append('From', params.from);
    if (params.to) formParams.append('To', params.to);
    if (params.callerId || process.env.EXOTEL_PHONE_NUMBER) {
      formParams.append('CallerId', params.callerId || process.env.EXOTEL_PHONE_NUMBER || '');
    }
    if (params.url) formParams.append('Url', params.url);

    this.logger.log('Initiating Exotel Call to ' + params.from + ' via ' + endpoint);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': this.authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formParams.toString(),
    });

    const data = await response.json();
    if (!response.ok) {
      const errorMsg = data?.RestException?.Message || ('Exotel API error ' + response.status);
      this.logger.error('Exotel Call Failed: ' + errorMsg);
      throw new Error(errorMsg);
    }

    return data;
  }

  async sendSms(to: string, message: string): Promise<any> {
    const endpoint = this.baseUrl + '/Sms/send.json';
    const formParams = new URLSearchParams();
    formParams.append('To', to);
    formParams.append('Body', message);
    if (process.env.EXOTEL_SENDER_ID) {
      formParams.append('From', process.env.EXOTEL_SENDER_ID);
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': this.authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formParams.toString(),
    });

    return response.json();
  }
}
