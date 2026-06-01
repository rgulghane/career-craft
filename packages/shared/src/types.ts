export type ReferralRowStatus =
  | "PENDING_PAYMENT"
  | "IN_REFUND_WINDOW"
  | "QUALIFIED"
  | "VOIDED";

export interface DashboardReferral {
  id: string;
  refereeEmailMasked: string;
  status: ReferralRowStatus;
  createdAt: string;
  qualifiedAt: string | null;
}

export interface DashboardResponse {
  user: {
    id: string;
    email: string;
    fullName: string;
    referralCode: string | null;
  };
  pricing: {
    amountInRupees: number;
    currency: "INR";
    label: string;
  };
  stats: {
    totalAttributed: number;
    qualified: number;
    pending: number;
    towardSilver: number;
    towardGold: number;
    towardDiamond: number;
  };
  milestones: {
    silverAt: number;
    goldAt: number;
    diamondAt: number;
  };
  referrals: DashboardReferral[];
}
