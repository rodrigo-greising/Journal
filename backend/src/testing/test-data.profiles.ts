export interface TestProfile {
  name: string;
  description: string;
  entries: TestJournalEntry[];
}

export interface TestJournalEntry {
  content: string;
  type: 'text' | 'audio';
  dateOffset: number; // Days from today (negative for past)
  expectedAnalysis?: {
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

export const TEST_PROFILES: TestProfile[] = [
  {
    name: 'realistic-health-journey',
    description: 'Realistic 30-day health and wellness journey with varied entries',
    entries: [
      {
        content: 'Starting this journal thing my therapist recommended. Had a rough morning - overslept and missed my workout. Grabbed a donut and coffee on the way to work. Feeling pretty scattered today.',
        type: 'text',
        dateOffset: -30,
      },
      {
        content: 'Better day today! Managed to wake up early and did a 20-minute yoga session. Made overnight oats with berries for breakfast. Energy feels more stable. Still stressed about the presentation tomorrow though.',
        type: 'text',
        dateOffset: -29,
      },
      {
        content: 'Presentation went okay. Not great, but okay. Had lunch with Emma - we went to that new salad place. Actually enjoyed it more than I expected. Feeling cautiously optimistic.',
        type: 'text',
        dateOffset: -28,
      },
      {
        content: 'Ugh, terrible night. Barely slept - maybe 3 hours? My mind was racing about work stuff. Felt exhausted all day. Ordered pizza for dinner because I couldn\'t be bothered to cook.',
        type: 'text',
        dateOffset: -26,
      },
      {
        content: 'Had therapy today. We talked about the anxiety and sleep issues. Dr. Martinez gave me some breathing exercises to try. Feeling hopeful but also emotionally drained. Made a simple pasta dinner.',
        type: 'text',
        dateOffset: -24,
      },
      {
        content: 'First good night\'s sleep in a week! Woke up feeling refreshed. The breathing exercises actually helped. Had a proper breakfast - eggs and whole grain toast. Tackled that project I\'ve been avoiding.',
        type: 'text',
        dateOffset: -22,
      },
      {
        content: 'Weekend was nice. Went hiking with Mark and had a great time. Packed sandwiches and fruit. Felt really energized by being outdoors. Realized I need to do this more often.',
        type: 'text',
        dateOffset: -21,
      },
      {
        content: 'Monday blues hitting hard. Weekend felt so short. Had a boring salad for lunch and felt unsatisfied. Snacked on chips all afternoon. Need to meal prep better.',
        type: 'text',
        dateOffset: -19,
      },
      {
        content: 'Panic attack during grocery shopping. Started in the cereal aisle - suddenly felt like I couldn\'t breathe. Had to leave my cart and sit in the car for 20 minutes. Ordered takeout instead.',
        type: 'text',
        dateOffset: -17,
      },
      {
        content: 'Called in sick today. Still shaken from yesterday. Spent most of the day on the couch watching Netflix. Ate leftover Chinese food. Feeling guilty but also just need to rest.',
        type: 'text',
        dateOffset: -16,
      },
      {
        content: 'Back to work. Colleagues were understanding about yesterday. Had a good conversation with my manager about workload. Brought a homemade sandwich for lunch. Small steps.',
        type: 'text',
        dateOffset: -15,
      },
      {
        content: 'Tried the new meditation app. 10 minutes felt like forever but I stuck with it. Had a proper dinner - grilled chicken with roasted vegetables. Proud of myself for cooking.',
        type: 'text',
        dateOffset: -13,
      },
      {
        content: 'Date night with Alex. We went to that Italian place downtown. Shared a pizza and laughed a lot. Felt normal and happy for the first time in weeks. This is what I\'m working toward.',
        type: 'text',
        dateOffset: -11,
      },
      {
        content: 'Busy day at work but managed it well. Used the breathing techniques when I felt overwhelmed. Had a quinoa bowl for lunch. Energy stayed consistent throughout the day.',
        type: 'text',
        dateOffset: -9,
      },
      {
        content: 'Mom called about Dad\'s test results. Not great news. Spent the evening crying and eating ice cream straight from the container. Sometimes life just sucks.',
        type: 'text',
        dateOffset: -7,
      },
      {
        content: 'Drove to see my parents. Dad looks tired but he\'s fighting. We had dinner together - Mom made her famous lasagna. Family time felt healing despite everything.',
        type: 'text',
        dateOffset: -6,
      },
      {
        content: 'Back home. Processing a lot of emotions about Dad. Therapy session was really helpful today. Made a simple stir-fry for dinner. Trying to maintain healthy habits even when stressed.',
        type: 'text',
        dateOffset: -4,
      },
      {
        content: 'Good workout today - felt strong and capable. Had avocado toast for breakfast and a big salad for lunch. Energy levels are definitely improving with better sleep and exercise.',
        type: 'text',
        dateOffset: -3,
      },
      {
        content: 'Weekend grocery shopping without any anxiety! Got ingredients for meal prep. Made a big batch of soup and quinoa bowls. Feeling organized and prepared for the week.',
        type: 'text',
        dateOffset: -2,
      },
      {
        content: 'Reflecting on the past month. Still have hard days but I\'m definitely stronger than when I started. Sleep is better, eating is more mindful, and I have tools for anxiety now. Progress isn\'t linear but it\'s happening.',
        type: 'text',
        dateOffset: -1,
      },
    ],
  },
  {
    name: 'nutrition-focused',
    description: 'Food-focused entries for testing nutrition analysis',
    entries: [
      {
        content: 'Starting a new eating plan today. Breakfast was oatmeal with blueberries and almonds. Lunch is planned - grilled chicken salad. Feeling motivated to make healthier choices.',
        type: 'text',
        dateOffset: -14,
      },
      {
        content: 'Week 1 going well! Had Greek yogurt with granola for breakfast, quinoa bowl with vegetables for lunch. Made salmon with sweet potato for dinner. Lots of energy today.',
        type: 'text',
        dateOffset: -7,
      },
      {
        content: 'Fell off the wagon yesterday. Had fast food - burger, fries, and a milkshake. Feeling sluggish and guilty today. Back to healthy eating with a green smoothie and salad.',
        type: 'text',
        dateOffset: -3,
      },
      {
        content: 'Found a good balance now. Had eggs and whole grain toast for breakfast, turkey sandwich for lunch, and homemade pasta with vegetables for dinner. Feeling satisfied and energized.',
        type: 'text',
        dateOffset: -1,
      },
    ],
  },
  {
    name: 'mental-health-focused',
    description: 'Mental health focused entries for testing mood and trigger analysis',
    entries: [
      {
        content: 'Therapy session today was intense. We talked about childhood trauma and I felt really triggered. Came home and couldn\'t stop crying. Ordered comfort food - pizza and ice cream.',
        type: 'text',
        dateOffset: -10,
      },
      {
        content: 'Better day today. Used the coping strategies from therapy when I felt anxious. Went for a walk instead of spiraling. Had a light lunch and felt accomplished.',
        type: 'text',
        dateOffset: -7,
      },
      {
        content: 'Panic attack at work during the team meeting. Had to excuse myself and do breathing exercises in the bathroom. Felt embarrassed but proud that I handled it without leaving completely.',
        type: 'text',
        dateOffset: -4,
      },
      {
        content: 'Great breakthrough in therapy! Finally understood a pattern I\'ve been stuck in. Feeling hopeful and empowered. Celebrated with a nice dinner out with friends.',
        type: 'text',
        dateOffset: -1,
      },
    ],
  },
];