import { config } from 'dotenv';
config();

import '@/ai/flows/personalized-offers.ts';
import '@/ai/flows/summarize-feedback.ts';
import '@/ai/flows/predict-churn.ts';