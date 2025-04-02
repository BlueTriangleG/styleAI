'use server';

import { query } from '@/lib/db';
import { getJobsByUserId } from '@/lib/models/job';
import {
  HistoryReportData,
  StyleRecommendation,
  TargetDescription,
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

          // Process target_description to extract analysis result and store the full JSON
          let analysisResult = '';
          let parsedDescription: TargetDescription | null = null;

          if (job.target_description) {
            try {
              // Parse JSON if it's a string or buffer
              if (Buffer.isBuffer(job.target_description)) {
                parsedDescription = JSON.parse(
                  job.target_description.toString('utf8')
                );
              } else if (typeof job.target_description === 'string') {
                parsedDescription = JSON.parse(job.target_description);
              } else {
                // It's already an object
                parsedDescription = job.target_description as TargetDescription;
              }

              // Extract relevant information for display (summary)
              if (
                parsedDescription &&
                parsedDescription['Your Overall Description'] &&
                parsedDescription['Your Overall Description'][
                  'Physical and Temperament Summary'
                ]
              ) {
                analysisResult =
                  parsedDescription['Your Overall Description'][
                    'Physical and Temperament Summary'
                  ];
              } else if (parsedDescription) {
                // Fallback if summary not available
                analysisResult =
                  'Style analysis completed. Check details for full report.';
              } else {
                analysisResult = 'Style analysis completed';
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
              : new Date('2025-03-10T00:00:00.000Z').toISOString(),
            analysisResult: analysisResult,
            targetDescription: parsedDescription || {
              'Structural Features': {
                'Body Features': {
                  'Height and Visual Impression': '',
                  'Head-to-Body Proportion and Visual Effect': '',
                  'Body Type and Curve Characteristics': '',
                  'Overall Body Weight Impression': '',
                  'Shoulder Width and Head-to-Shoulder Ratio': '',
                  'Waistline Position and Upper-to-Lower Body Proportion': '',
                  'Limb Length and Visual Proportion': '',
                  'Limb Thickness and Line Definition': '',
                  'Body Hair Characteristics': {
                    'Facial Hair': '',
                  },
                },
                'Facial Features': {
                  'Hairstyle Details and Style Characteristics': '',
                  'Face Shape and Visual Outline': '',
                  'Facial Structure and Visual Features': '',
                  'Facial Contour and Line Definition': '',
                  'Neck Length and Line Characteristics': '',
                },
              },
              'Color Features': {
                'Skin Tone and Visual Characteristics': '',
                'Hair Color and Saturation': '',
                'Clothing Color Optimization Suggestions': '',
              },
              'Semantic Features': {
                'Intrinsic Features': {
                  Gender: '',
                  'Age Range Visual Estimation': '',
                },
                'Temperament Features': {
                  'Overall Style First Impression': '',
                  'Personality Impressions from Expression and Posture': '',
                  'Style Optimization and Temperament Enhancement Suggestions':
                    '',
                },
              },
              'Your Overall Description': {
                'Physical and Temperament Summary':
                  'No detailed analysis available',
              },
            },
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
            targetDescription: {
              'Structural Features': {
                'Body Features': {
                  'Height and Visual Impression': '',
                  'Head-to-Body Proportion and Visual Effect': '',
                  'Body Type and Curve Characteristics': '',
                  'Overall Body Weight Impression': '',
                  'Shoulder Width and Head-to-Shoulder Ratio': '',
                  'Waistline Position and Upper-to-Lower Body Proportion': '',
                  'Limb Length and Visual Proportion': '',
                  'Limb Thickness and Line Definition': '',
                  'Body Hair Characteristics': {
                    'Facial Hair': '',
                  },
                },
                'Facial Features': {
                  'Hairstyle Details and Style Characteristics': '',
                  'Face Shape and Visual Outline': '',
                  'Facial Structure and Visual Features': '',
                  'Facial Contour and Line Definition': '',
                  'Neck Length and Line Characteristics': '',
                },
              },
              'Color Features': {
                'Skin Tone and Visual Characteristics': '',
                'Hair Color and Saturation': '',
                'Clothing Color Optimization Suggestions': '',
              },
              'Semantic Features': {
                'Intrinsic Features': {
                  Gender: '',
                  'Age Range Visual Estimation': '',
                },
                'Temperament Features': {
                  'Overall Style First Impression': '',
                  'Personality Impressions from Expression and Posture': '',
                  'Style Optimization and Temperament Enhancement Suggestions':
                    '',
                },
              },
              'Your Overall Description': {
                'Physical and Temperament Summary':
                  'Error loading analysis data',
              },
            },
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
