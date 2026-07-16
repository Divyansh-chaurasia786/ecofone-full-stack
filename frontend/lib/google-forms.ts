/**
 * EcoFone Google Forms Integration Helper
 * Submits custom HTML/React form payloads directly to a Google Form Response webhook.
 * This runs on the client-side using 'no-cors' request mode.
 */

export async function submitToGoogleForm(formType: 'Contact' | 'Franchise', data: any) {
  // Configurable Google Form ID (can be overridden via next.config env or process.env)
  const formId = process.env.NEXT_PUBLIC_GOOGLE_FORM_ID || '1FAIpQLScXfXzEaT-yD_Zq8J4o4x_e0n3w5z2h9N6B5Z-X6XQ-MOCK';
  
  // Mappings of input fields to Google Form entry parameters
  const entryFormType = process.env.NEXT_PUBLIC_ENTRY_FORM_TYPE || 'entry.2000001';
  const entryName = process.env.NEXT_PUBLIC_ENTRY_NAME || 'entry.2000002';
  const entryEmail = process.env.NEXT_PUBLIC_ENTRY_EMAIL || 'entry.2000003';
  const entryPhone = process.env.NEXT_PUBLIC_ENTRY_PHONE || 'entry.2000004';
  const entryLocation = process.env.NEXT_PUBLIC_ENTRY_LOCATION || 'entry.2000005';
  const entryInvestment = process.env.NEXT_PUBLIC_ENTRY_INVESTMENT || 'entry.2000006';
  const entryMessage = process.env.NEXT_PUBLIC_ENTRY_MESSAGE || 'entry.2000007';
  const entryDateTime = process.env.NEXT_PUBLIC_ENTRY_DATETIME || 'entry.2000008';

  // Construct standard URL-encoded form data parameters
  const urlParams = new URLSearchParams();
  urlParams.append(entryFormType, formType);
  urlParams.append(entryName, data.applicantName || '');
  urlParams.append(entryEmail, data.email || '');
  urlParams.append(entryPhone, data.phone || '');
  urlParams.append(entryLocation, data.locationPreference || '');
  urlParams.append(entryInvestment, data.investmentCapacity ? `Rs. ${Number(data.investmentCapacity).toLocaleString('en-IN')}` : 'N/A');
  urlParams.append(entryMessage, data.experienceDesc || '');
  urlParams.append(entryDateTime, new Date().toLocaleString('en-IN'));

  const submitUrl = `https://docs.google.com/forms/d/e/${formId}/formResponse`;

  try {
    // Note: Google Forms requires 'no-cors' mode to prevent client-side CORS errors.
    // The request will successfully hit the server, even though Response is opaque.
    await fetch(submitUrl, {
      method: 'POST',
      body: urlParams,
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    console.log(`[Google Forms Link] Successfully sent ${formType} payload to Google Form.`);
  } catch (error) {
    console.error('[Google Forms Link] Failed to dispatch data payload to Google Forms webhook:', error);
  }
}
