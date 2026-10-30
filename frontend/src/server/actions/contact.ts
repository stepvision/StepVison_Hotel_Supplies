'use server';

import { runAction } from '../http';
import { parseInput } from '../schemas/common';
import { contactSchema } from '../schemas/contact';
import { sendEnquiry } from '../services/contact';

// Public: anyone on the site can send an enquiry.
export async function sendEnquiryAction(body: unknown) {
    return runAction(() => sendEnquiry(parseInput(contactSchema, body)));
}
