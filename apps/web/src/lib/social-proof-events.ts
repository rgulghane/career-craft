/** Synthetic activity lines for homepage social-proof toasts (marketing only). */

const FIRST_NAMES = [
  "Aarav",
  "Priya",
  "Rohan",
  "Ananya",
  "Vikram",
  "Sneha",
  "Arjun",
  "Kavya",
  "Rahul",
  "Divya",
  "Karan",
  "Meera",
  "Aditya",
  "Isha",
  "Nikhil",
  "Pooja",
  "Siddharth",
  "Neha",
  "Varun",
  "Shreya",
] as const;

const CITIES = [
  "Pune",
  "Nagpur",
  "Indore",
  "Bhopal",
  "Jaipur",
  "Lucknow",
  "Patna",
  "Coimbatore",
  "Mysuru",
  "Vadodara",
  "Surat",
  "Raipur",
  "Bhubaneswar",
  "Guwahati",
  "Kochi",
  "Visakhapatnam",
  "Nashik",
  "Agra",
  "Kanpur",
  "Thiruvananthapuram",
] as const;

const REFERRAL_CODES = ["KAVYA9X2", "ROHAN4M", "PRIYA7K", "ARJUN2P", "NEHA8Q", "VIKRAM3N"] as const;

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

function pickName(): string {
  return pick(FIRST_NAMES);
}

function pickCity(): string {
  return pick(CITIES);
}

function minutesAgo(): number {
  return 1 + Math.floor(Math.random() * 12);
}

export type SocialProofToast = {
  text: string;
  variant: "purchase" | "referral" | "earn" | "join";
};

export function randomSocialProofToast(): SocialProofToast {
  const name = pickName();
  const city = pickCity();
  const mins = minutesAgo();
  const roll = Math.random();

  if (roll < 0.28) {
    return {
      variant: "purchase",
      text: `${name} purchased the course from ${city}`,
    };
  }
  if (roll < 0.5) {
    return {
      variant: "referral",
      text: `${name} used referral code ${pick(REFERRAL_CODES)} and saved 50%`,
    };
  }
  if (roll < 0.72) {
    return {
      variant: "earn",
      text: `${name} earned ₹500 by referring a friend`,
    };
  }
  if (roll < 0.86) {
    return {
      variant: "join",
      text: `${name} from ${city} enrolled · ${mins} min ago`,
    };
  }
  if (roll < 0.93) {
    return {
      variant: "purchase",
      text: `Someone in ${city} just secured a seat in Cohort 4`,
    };
  }
  return {
    variant: "referral",
    text: `${name} unlocked the referral price — saved ₹2,500`,
  };
}

/** Delay before first toast (ms). */
export function initialToastDelayMs(): number {
  return 4_000 + Math.random() * 4_000;
}

/** Delay until next toast after one hides (ms). */
export function nextToastDelayMs(): number {
  return 10_000 + Math.random() * 14_000;
}

/** How long each toast stays visible (ms). */
export function toastVisibleMs(): number {
  return 4_500 + Math.random() * 1_500;
}
