// src/utils/billingUtils.ts

export function calculateNextBillingDate(lastBillingDate: Date): Date {
    const nextBillingDate = new Date(lastBillingDate.getTime());
    nextBillingDate.setMinutes(lastBillingDate.getMinutes() + 15);
    return nextBillingDate;
  }
  
  export function formatDate(date: Date): string {
    if (!date) {return ""}
    const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
    return date.toLocaleTimeString('it-IT', options);
  }
