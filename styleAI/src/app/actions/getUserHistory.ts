'use server';

import { query } from '@/lib/db';
import { getJobsByUserId } from '@/lib/models/job';
import {
  HistoryReportData,
  StyleRecommendation,
} from '@/components/userHistory/types';

/**
 * Fetches history data for a specific user
 * Retrieves all jobs associated with the user and converts them to frontend-friendly format
 *
 * @param userId - The ID of the user to fetch history for
 * @returns Array of history report data objects
 */
export async function getUserHistory(
  userId: string
): Promise<HistoryReportData[]> {
  try {
    console.log(`Fetching job history for user: ${userId}`);

    // Validate userId
    if (!userId) {
      console.error('getUserHistory called without userId');
      throw new Error('User ID is required');
    }

    // Try to get all jobs for the user, with error handling
    let jobs;
    try {
      jobs = await getJobsByUserId(userId);
    } catch (dbError) {
      console.error('Database error when fetching jobs:', dbError);
      throw new Error(
        'Could not connect to the database. Please try again later.'
      );
    }

    if (!jobs || jobs.length === 0) {
      console.log(`No job history found for user: ${userId}`);
      return [];
    }

    console.log(`Found ${jobs.length} job records for user: ${userId}`);

    // Transform jobs into HistoryReportData format
    const historyData: HistoryReportData[] = await Promise.all(
      jobs.map(async (job) => {
        try {
          // Convert BYTEA images to base64 strings
          const uploadedImage = job.uploaded_image
            ? `data:image/png;base64,${Buffer.from(job.uploaded_image).toString(
                'base64'
              )}`
            : '';

          const bestFitImage = job.best_fit
            ? `data:image/png;base64,${Buffer.from(job.best_fit).toString(
                'base64'
              )}`
            : '';

          // Process other style recommendations
          const otherStyleRecommendations: StyleRecommendation[] = [];

          // Add casual_daily if exists
          if (job.casual_daily) {
            otherStyleRecommendations.push({
              styleType: 'casual_daily',
              imageUrl: `data:image/png;base64,${Buffer.from(
                job.casual_daily
              ).toString('base64')}`,
            });
          }

          // Add professional_work if exists
          if (job.professional_work) {
            otherStyleRecommendations.push({
              styleType: 'professional_work',
              imageUrl: `data:image/png;base64,${Buffer.from(
                job.professional_work
              ).toString('base64')}`,
            });
          }

          // Add social_gathering if exists
          if (job.social_gathering) {
            otherStyleRecommendations.push({
              styleType: 'social_gathering',
              imageUrl: `data:image/png;base64,${Buffer.from(
                job.social_gathering
              ).toString('base64')}`,
            });
          }

          // Add outdoor_sports if exists
          if (job.outdoor_sports) {
            otherStyleRecommendations.push({
              styleType: 'outdoor_sports',
              imageUrl: `data:image/png;base64,${Buffer.from(
                job.outdoor_sports
              ).toString('base64')}`,
            });
          }

          // Process target_description to extract analysis result
          let analysisResult = '';
          if (job.target_description) {
            try {
              // Parse JSON if it's a string or buffer
              let parsedDescription;
              if (Buffer.isBuffer(job.target_description)) {
                parsedDescription = JSON.parse(
                  job.target_description.toString('utf8')
                );
              } else if (typeof job.target_description === 'string') {
                parsedDescription = JSON.parse(job.target_description);
              } else {
                // It's already an object
                parsedDescription = job.target_description;
              }

              // Extract relevant information for display
              // This will depend on your specific JSON structure
              // Simple example assuming target_description has a summary field
              if (parsedDescription.summary) {
                analysisResult = parsedDescription.summary;
              } else if (parsedDescription.analysis) {
                analysisResult = parsedDescription.analysis;
              } else {
                // Create a fallback string
                analysisResult = `Analysis completed on ${new Date(
                  job.created_at || Date.now()
                ).toLocaleDateString()}`;
              }
            } catch (error) {
              console.error('Error parsing target_description:', error);
              analysisResult = 'Style analysis completed';
            }
          } else {
            analysisResult = 'Style analysis completed';
          }

          return {
            id: job.id,
            userId: job.user_id,
            uploadedImage: uploadedImage,
            bestFitImage: bestFitImage,
            createdAt: job.created_at
              ? job.created_at.toISOString()
              : new Date().toISOString(),
            analysisResult: analysisResult,
            otherStyleRecommendations: otherStyleRecommendations,
          };
        } catch (itemError) {
          console.error('Error processing job item:', itemError, job.id);
          // Return a placeholder item instead of failing the entire map
          return {
            id: job.id || 'unknown-id',
            userId: job.user_id || userId,
            uploadedImage: '',
            bestFitImage: '',
            createdAt: new Date().toISOString(),
            analysisResult: 'Error loading job details',
            otherStyleRecommendations: [],
          };
        }
      })
    );

    return historyData;
  } catch (error) {
    console.error('Error fetching user job history:', error);
    // Return an empty array instead of throwing to prevent page crashes
    return [];
  }
}
