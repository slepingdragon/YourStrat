import type { TodayMetricId } from "@/lib/todayMetrics";

export type NutritionSourceLink = {
  title: string;
  url: string;
  domain: string;
};

export const METRIC_LEARN_MORE: Record<TodayMetricId, NutritionSourceLink[]> = {
  calories: [
    {
      title: "USDA FoodData Central",
      url: "https://fdc.nal.usda.gov/",
      domain: "fdc.nal.usda.gov",
    },
    {
      title: "Tracking calories and weight (NIH)",
      url: "https://www.nhlbi.nih.gov/health/educational/wecan/eat-right/keep-track-calories.htm",
      domain: "nhlbi.nih.gov",
    },
    {
      title: "Healthy Eating Plate — Harvard T.H. Chan School of Public Health",
      url: "https://www.hsph.harvard.edu/nutritionsource/healthy-eating-plate/",
      domain: "hsph.harvard.edu",
    },
  ],
  protein: [
    {
      title: "Protein — NIH Office of Dietary Supplements",
      url: "https://ods.od.nih.gov/factsheets/Protein-Consumer/",
      domain: "ods.od.nih.gov",
    },
    {
      title: "How much protein do I need? — Academy of Nutrition and Dietetics",
      url: "https://www.eatright.org/food/nutrition/dietary-guidelines-and-myplate/how-much-protein-do-i-need",
      domain: "eatright.org",
    },
    {
      title: "USDA FoodData Central",
      url: "https://fdc.nal.usda.gov/",
      domain: "fdc.nal.usda.gov",
    },
  ],
  carbs: [
    {
      title: "Carbohydrates — Harvard T.H. Chan School of Public Health",
      url: "https://www.hsph.harvard.edu/nutritionsource/carbohydrates/",
      domain: "hsph.harvard.edu",
    },
    {
      title: "USDA FoodData Central",
      url: "https://fdc.nal.usda.gov/",
      domain: "fdc.nal.usda.gov",
    },
    {
      title: "Nutrition basics — NIH National Institute on Aging",
      url: "https://www.nia.nih.gov/health/nutrition-and-healthy-eating",
      domain: "nia.nih.gov",
    },
  ],
  fat: [
    {
      title: "Dietary fats — Harvard T.H. Chan School of Public Health",
      url: "https://www.hsph.harvard.edu/nutritionsource/what-should-you-eat/fats-and-cholesterol/",
      domain: "hsph.harvard.edu",
    },
    {
      title: "USDA FoodData Central",
      url: "https://fdc.nal.usda.gov/",
      domain: "fdc.nal.usda.gov",
    },
    {
      title: "Dietary fats explained — MedlinePlus (NIH)",
      url: "https://medlineplus.gov/ency/patientinstructions/000104.htm",
      domain: "medlineplus.gov",
    },
  ],
  sugar: [
    {
      title: "Healthy diet — World Health Organization",
      url: "https://www.who.int/news-room/fact-sheets/detail/healthy-diet",
      domain: "who.int",
    },
    {
      title: "Know your limit for added sugars — CDC",
      url: "https://www.cdc.gov/nutrition/data-statistics/added-sugars.html",
      domain: "cdc.gov",
    },
  ],
  sodium: [
    {
      title: "Sodium in your diet — U.S. Food and Drug Administration",
      url: "https://www.fda.gov/food/nutrition-education-resources-materials/sodium-your-diet",
      domain: "fda.gov",
    },
    {
      title: "How much sodium should I eat per day? — American Heart Association",
      url: "https://www.heart.org/en/healthy-living/healthy-eating/eat-smart/sodium/how-much-sodium-should-i-eat-per-day",
      domain: "heart.org",
    },
  ],
  fiber: [
    {
      title: "Dietary fiber: Essential for a healthy diet — Mayo Clinic",
      url: "https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating/in-depth/fiber/art-20043983",
      domain: "mayoclinic.org",
    },
    {
      title: "Dietary Guidelines for Americans — USDA",
      url: "https://www.dietaryguidelines.gov/",
      domain: "dietaryguidelines.gov",
    },
  ],
};

export function faviconUrl(domain: string) {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32`;
}
