export interface TestProfile {
  name: string;
  description: string;
  entries: TestJournalEntry[];
}

export interface TestJournalEntry {
  content: string;
  type: 'text' | 'audio';
  dateOffset: number; // Days from today (negative for past)
  expectedAnalysis: {
    mood?: {
      moodScale: number;
      sentiment: string;
      emotions: string[];
    };
    energy?: {
      energyLevel: number;
      fatigueIndicators: string[];
      sleepQuality?: number;
    };
    nutrition?: {
      foodMentions: string[];
      calorieEstimate?: number;
      macros?: {
        protein: number;
        carbs: number;
        fat: number;
      };
    };
    triggers?: {
      stressors: string[];
      cravings?: string[];
      riskFactors?: string[];
    };
  };
}

export const IMPROVED_TEST_PROFILES: TestProfile[] = [
  {
    name: 'addiction-recovery-realistic',
    description: 'Realistic addiction recovery journey with varied language and situations',
    entries: [
      {
        content: 'Day 1. Hands shaking. Made eggs and toast. Dave destroyed my presentation today - felt my chest get tight, wanted a drink so bad. Called Sarah instead.',
        type: 'text',
        dateOffset: -30,
        expectedAnalysis: {
          mood: {
            moodScale: 3,
            sentiment: 'negative',
            emotions: ['anxious', 'frustrated', 'vulnerable'],
          },
          energy: {
            energyLevel: 4,
            fatigueIndicators: ['physical withdrawal', 'shaking'],
          },
          nutrition: {
            foodMentions: ['eggs', 'whole grains'],
          },
          triggers: {
            stressors: ['work criticism', 'withdrawal'],
            cravings: ['alcohol'],
            riskFactors: ['physical symptoms', 'emotional stress'],
          },
        },
      },
      {
        content: 'Been 4 days. Woke up at 3am drenched in sweat again but managed to get back to sleep. Had a really good breakfast - oatmeal with blueberries and some orange juice. Energy is all over the place. Went for a walk around the block twice. Still getting random waves of wanting to drink but they pass quicker now. Jim from AA said that was normal. Meeting tonight helped.',
        type: 'text',
        dateOffset: -27,
        expectedAnalysis: {
          mood: {
            moodScale: 5,
            sentiment: 'mixed',
            emotions: ['hopeful', 'tired', 'determined'],
          },
          energy: {
            energyLevel: 5,
            fatigueIndicators: ['night sweats', 'disrupted sleep'],
            sleepQuality: 4,
          },
          nutrition: {
            foodMentions: ['whole grains', 'fruits', 'fruit juice'],
          },
          triggers: {
            stressors: ['sleep disruption'],
            cravings: ['alcohol'],
            riskFactors: ['withdrawal symptoms'],
          },
        },
      },
      {
        content: 'Two weeks! Crazy how different I feel. Sleep is getting better - only woke up once last night instead of three times. Had a massive lunch at that new Mediterranean place - grilled chicken, rice, tons of vegetables. Feeling strong today. Even tackled that project I\'ve been avoiding. No cravings since yesterday morning.',
        type: 'text',
        dateOffset: -16,
        expectedAnalysis: {
          mood: {
            moodScale: 8,
            sentiment: 'positive',
            emotions: ['proud', 'energetic', 'confident'],
          },
          energy: {
            energyLevel: 8,
            fatigueIndicators: [],
            sleepQuality: 7,
          },
          nutrition: {
            foodMentions: ['lean protein', 'whole grains', 'vegetables'],
          },
          triggers: {
            stressors: [],
            cravings: [],
            riskFactors: [],
          },
        },
      },
      {
        content: 'Rough patch yesterday and today. Mom\'s cancer results came back and it\'s not good news. Spent most of the day at the hospital. Barely ate - just grabbed a protein bar and some coffee. The old me would have gone straight to the liquor store. Instead I called my sponsor and we talked for an hour. Still hurting but I\'m sober.',
        type: 'text',
        dateOffset: -8,
        expectedAnalysis: {
          mood: {
            moodScale: 2,
            sentiment: 'very negative',
            emotions: ['grief', 'scared', 'overwhelmed', 'proud'],
          },
          energy: {
            energyLevel: 3,
            fatigueIndicators: ['emotional stress', 'not eating enough'],
          },
          nutrition: {
            foodMentions: ['protein supplements', 'caffeinated beverages'],
          },
          triggers: {
            stressors: ['family health crisis', 'hospital environment'],
            cravings: ['alcohol'],
            riskFactors: ['major life stress', 'emotional trauma'],
          },
        },
      },
      {
        content: 'Month celebration at the diner with Tom and Sarah. Pancakes, bacon, the works. Feeling grateful and strong. Energy levels are stable now, sleeping through the night most days. Strange to think how different everything is from 30 days ago.',
        type: 'text',
        dateOffset: -1,
        expectedAnalysis: {
          mood: {
            moodScale: 9,
            sentiment: 'very positive',
            emotions: ['grateful', 'accomplished', 'stable'],
          },
          energy: {
            energyLevel: 8,
            fatigueIndicators: [],
            sleepQuality: 8,
          },
          nutrition: {
            foodMentions: ['refined grains', 'processed meat', 'fats'],
          },
          triggers: {
            stressors: [],
            cravings: [],
            riskFactors: [],
          },
        },
      },
    ],
  },
  {
    name: 'nutrition-tracking-detailed',
    description: 'Detailed nutrition tracking with varied meal descriptions and health focus',
    entries: [
      {
        content: 'Starting this food journal thing my doctor recommended. Breakfast was rushed - just grabbed a banana and coffee on the way to work. Lunch was that quinoa salad from the place downstairs, pretty good actually. Dinner was pasta with marinara sauce and a side salad. Feeling okay energy-wise but definitely need to plan better.',
        type: 'text',
        dateOffset: -14,
        expectedAnalysis: {
          mood: {
            moodScale: 6,
            sentiment: 'neutral',
            emotions: ['motivated', 'slightly frustrated'],
          },
          energy: {
            energyLevel: 6,
            fatigueIndicators: ['rushed morning'],
          },
          nutrition: {
            foodMentions: ['fruits', 'caffeinated beverages', 'whole grains', 'vegetables', 'refined grains'],
          },
        },
      },
      {
        content: 'Much better day food-wise! Made overnight oats with Greek yogurt, chia seeds, and berries. Felt full and energized all morning. Lunch was a big salad with grilled salmon, avocado, and lots of colorful veggies. Snacked on almonds and an apple. Dinner was stir-fried tofu with brown rice and broccoli. Sleeping better too - got a solid 8 hours.',
        type: 'text',
        dateOffset: -7,
        expectedAnalysis: {
          mood: {
            moodScale: 8,
            sentiment: 'positive',
            emotions: ['satisfied', 'energetic', 'proud'],
          },
          energy: {
            energyLevel: 8,
            fatigueIndicators: [],
            sleepQuality: 8,
          },
          nutrition: {
            foodMentions: ['whole grains', 'protein', 'healthy fats', 'fruits', 'vegetables', 'nuts'],
          },
        },
      },
      {
        content: 'Ugh, total food disaster today. Overslept, skipped breakfast. Stress-ate a donut and large latte during the morning meeting. Lunch was fast food - burger, fries, soda. Felt gross and sluggish all afternoon. Tried to compensate with just a salad for dinner but I\'m still feeling guilty and low energy.',
        type: 'text',
        dateOffset: -3,
        expectedAnalysis: {
          mood: {
            moodScale: 3,
            sentiment: 'negative',
            emotions: ['guilty', 'frustrated', 'disappointed'],
          },
          energy: {
            energyLevel: 3,
            fatigueIndicators: ['poor food choices', 'sugar crash'],
          },
          nutrition: {
            foodMentions: ['refined sugar', 'caffeinated beverages', 'processed foods', 'vegetables'],
          },
        },
      },
    ],
  },
  {
    name: 'mental-health-varied',
    description: 'Varied mental health entries with different triggers and coping strategies',
    entries: [
      {
        content: 'Therapy was intense today. We dug into some childhood stuff I haven\'t thought about in years. Dr. Martinez says it\'s normal to feel stirred up after sessions like this. My chest feels tight and I keep replaying conversations from when I was 12. The breathing exercises help a little. Ordered Thai food for dinner - needed some comfort tonight.',
        type: 'text',
        dateOffset: -10,
        expectedAnalysis: {
          mood: {
            moodScale: 4,
            sentiment: 'negative',
            emotions: ['vulnerable', 'stirred up', 'processing'],
          },
          energy: {
            energyLevel: 5,
            fatigueIndicators: ['emotional processing'],
          },
          nutrition: {
            foodMentions: ['comfort food', 'takeout'],
          },
          triggers: {
            stressors: ['therapy session', 'childhood memories'],
            riskFactors: ['emotional overwhelm'],
          },
        },
      },
      {
        content: 'Amazing day! The presentation went perfectly and my manager actually complimented my work in front of the whole team. Felt confident and capable for once. Celebrated with lunch at that new sushi place - the salmon was incredible. Energy feels sustainable today, not that jittery anxious energy I usually have. Even managed a 30-minute walk after dinner.',
        type: 'text',
        dateOffset: -7,
        expectedAnalysis: {
          mood: {
            moodScale: 9,
            sentiment: 'very positive',
            emotions: ['confident', 'accomplished', 'joyful'],
          },
          energy: {
            energyLevel: 8,
            fatigueIndicators: [],
          },
          nutrition: {
            foodMentions: ['lean protein', 'healthy fats'],
          },
          triggers: {
            stressors: [],
            riskFactors: [],
          },
        },
      },
      {
        content: 'Panic attack during the grocery store trip. Started in the cereal aisle - suddenly couldn\'t breathe, felt like everyone was staring. Had to abandon my cart and sit in the car for 20 minutes doing the 4-7-8 breathing. Finally made it home but just ordered pizza instead of cooking. Hate that anxiety still controls me like this sometimes.',
        type: 'text',
        dateOffset: -4,
        expectedAnalysis: {
          mood: {
            moodScale: 2,
            sentiment: 'very negative',
            emotions: ['panicked', 'frustrated', 'defeated'],
          },
          energy: {
            energyLevel: 2,
            fatigueIndicators: ['panic attack', 'emotional exhaustion'],
          },
          nutrition: {
            foodMentions: ['processed foods', 'comfort food'],
          },
          triggers: {
            stressors: ['crowded spaces', 'public places'],
            riskFactors: ['panic disorder', 'avoidance behaviors'],
          },
        },
      },
      {
        content: 'Used the grounding technique when I felt anxiety creeping up at work today. 5 things I could see, 4 I could touch, 3 I could hear, 2 I could smell, 1 I could taste. It actually worked! Stayed present and finished the report without spiraling. Small victory but it feels huge. Made a nice dinner too - grilled chicken with roasted vegetables.',
        type: 'text',
        dateOffset: -1,
        expectedAnalysis: {
          mood: {
            moodScale: 7,
            sentiment: 'positive',
            emotions: ['proud', 'capable', 'hopeful'],
          },
          energy: {
            energyLevel: 7,
            fatigueIndicators: [],
          },
          nutrition: {
            foodMentions: ['lean protein', 'vegetables'],
          },
          triggers: {
            stressors: ['work pressure'],
            riskFactors: [],
          },
        },
      },
    ],
  },
];