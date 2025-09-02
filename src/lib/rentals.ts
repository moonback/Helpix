import { supabase } from '@/lib/supabase';

export type RentalStatus = 'requested' | 'accepted' | 'active' | 'completed' | 'cancelled';

export interface CreateRentalInput {
  itemId: number;
  ownerId: string;
  renterId: string;
  startDate: string; // ISO date
  endDate: string;   // ISO date
  dailyPrice: number; // credits/day
  depositCredits?: number;
}

export async function requestRental(input: CreateRentalInput) {
  const totalDays = Math.max(1, Math.ceil((new Date(input.endDate).getTime() - new Date(input.startDate).getTime()) / (1000 * 60 * 60 * 24)));
  const totalCredits = totalDays * input.dailyPrice;

  const { data, error } = await supabase
    .from('rentals')
    .insert({
      item_id: input.itemId,
      owner_id: input.ownerId,
      renter_id: input.renterId,
      start_date: input.startDate,
      end_date: input.endDate,
      daily_price: input.dailyPrice,
      total_credits: totalCredits,
      deposit_credits: input.depositCredits ?? 0,
      status: 'requested',
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function updateRentalStatus(rentalId: string, status: RentalStatus) {
  const { data, error } = await supabase
    .from('rentals')
    .update({ status })
    .eq('id', rentalId)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function listMyRentals(userId: string) {
  const { data, error } = await supabase
    .from('rentals')
    .select('*')
    .or(`owner_id.eq.${userId},renter_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}


