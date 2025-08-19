import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(req: NextRequest) {
  try {
    console.log('🎯 Starting Mukando reward distribution...');

    // Find groups that have completed their term and are ready for distribution
    const completedGroups = await prisma.mukandoGroup.findMany({
      where: {
        status: 'approved',
        // Check if term has been met (created + term_length months <= now)
        created_at: {
          lte: new Date(Date.now() - (30 * 24 * 60 * 60 * 1000)) // At least 1 month old for testing
        }
      },
      include: {
        members: {
          orderBy: {
            payout_order: 'asc'
          },
          include: {
            customer: {
              select: {
                user_id: true,
                full_name: true,
                loyalty_points: true
              }
            }
          }
        },
        business: {
          select: {
            business_name: true
          }
        }
      }
    });

    if (completedGroups.length === 0) {
      return NextResponse.json({
        message: 'No groups ready for reward distribution',
        processedGroups: 0
      });
    }

    const distributionResults = [];

    for (const group of completedGroups) {
      try {
        console.log(`💎 Processing group: ${group.goal_name} (${group.id})`);

        if (group.members.length === 0) {
          console.log('⚠️ Skipping group with no members');
          continue;
        }

        // Use transaction for atomic distribution
        const result = await prisma.$transaction(async (tx) => {
          // Find the current payout recipient (round-robin)
          const currentRecipientIndex = group.current_payout_turn % group.members.length;
          const currentRecipient = group.members[currentRecipientIndex];
          
          console.log(`🎁 Distributing ${group.total_loyalty_points_earned} points to ${currentRecipient.customer.full_name}`);

          // Award all accumulated loyalty points to the current recipient
          await tx.customer.update({
            where: { user_id: currentRecipient.customer_id },
            data: {
              loyalty_points: {
                increment: group.total_loyalty_points_earned
              }
            }
          });

          // Create transaction record for the payout
          await tx.transaction.create({
            data: {
              customer_id: currentRecipient.customer_id,
              business_id: group.business_id,
              transaction_type: 'mukando_payout',
              points_earned: group.total_loyalty_points_earned,
              mukando_group_id: group.id
            }
          });

          // Update group: increment payout turn and reset accumulated points
          await tx.mukandoGroup.update({
            where: { id: group.id },
            data: {
              current_payout_turn: group.current_payout_turn + 1,
              total_loyalty_points_earned: 0, // Reset for next cycle
              // If this was the final payout, mark as completed
              status: group.current_payout_turn + 1 >= group.members.length ? 'completed' : 'approved',
              completed_at: group.current_payout_turn + 1 >= group.members.length ? new Date() : null
            }
          });

          return {
            groupId: group.id,
            groupName: group.goal_name,
            recipientId: currentRecipient.customer_id,
            recipientName: currentRecipient.customer.full_name,
            pointsDistributed: group.total_loyalty_points_earned,
            payoutTurn: group.current_payout_turn + 1,
            isCompleted: group.current_payout_turn + 1 >= group.members.length
          };
        });

        distributionResults.push(result);
        console.log(`✅ Successfully distributed rewards for group ${group.id}`);

      } catch (error) {
        console.error(`❌ Error processing group ${group.id}:`, error);
        distributionResults.push({
          groupId: group.id,
          groupName: group.goal_name,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log(`🎉 Reward distribution complete. Processed ${distributionResults.length} groups.`);

    return NextResponse.json({
      message: 'Reward distribution completed',
      processedGroups: distributionResults.length,
      results: distributionResults
    });

  } catch (error) {
    console.error('❌ Reward distribution error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET endpoint to check groups ready for distribution (for monitoring)
export async function GET() {
  try {
    const readyGroups = await prisma.mukandoGroup.findMany({
      where: {
        status: 'approved',
        total_loyalty_points_earned: {
          gt: 0
        }
      },
      select: {
        id: true,
        goal_name: true,
        total_loyalty_points_earned: true,
        current_payout_turn: true,
        created_at: true,
        term_length: true,
        members: {
          select: {
            customer: {
              select: {
                full_name: true
              }
            }
          }
        },
        business: {
          select: {
            business_name: true
          }
        }
      }
    });

    return NextResponse.json({
      groupsReadyForDistribution: readyGroups.length,
      groups: readyGroups
    });

  } catch (error) {
    console.error('❌ Check ready groups error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
