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
    description:
      'Realistic 30-day health and wellness journey with varied entries',
    entries: [
      {
        content:
          'Starting this journal thing my therapist recommended. Had a rough morning - overslept and missed my workout. Grabbed a donut and coffee on the way to work. Feeling pretty scattered today.',
        type: 'text',
        dateOffset: -30,
      },
      {
        content:
          'Better day today! Managed to wake up early and did a 20-minute yoga session. Made overnight oats with berries for breakfast. Energy feels more stable. Still stressed about the presentation tomorrow though.',
        type: 'text',
        dateOffset: -29,
      },
      {
        content:
          'Presentation went okay. Not great, but okay. Had lunch with Emma - we went to that new salad place. Actually enjoyed it more than I expected. Feeling cautiously optimistic.',
        type: 'text',
        dateOffset: -28,
      },
      {
        content:
          "Ugh, terrible night. Barely slept - maybe 3 hours? My mind was racing about work stuff. Felt exhausted all day. Ordered pizza for dinner because I couldn't be bothered to cook.",
        type: 'text',
        dateOffset: -26,
      },
      {
        content:
          'Had therapy today. We talked about the anxiety and sleep issues. Dr. Martinez gave me some breathing exercises to try. Feeling hopeful but also emotionally drained. Made a simple pasta dinner.',
        type: 'text',
        dateOffset: -24,
      },
      {
        content:
          "First good night's sleep in a week! Woke up feeling refreshed. The breathing exercises actually helped. Had a proper breakfast - eggs and whole grain toast. Tackled that project I've been avoiding.",
        type: 'text',
        dateOffset: -22,
      },
      {
        content:
          'Weekend was nice. Went hiking with Mark and had a great time. Packed sandwiches and fruit. Felt really energized by being outdoors. Realized I need to do this more often.',
        type: 'text',
        dateOffset: -21,
      },
      {
        content:
          'Monday blues hitting hard. Weekend felt so short. Had a boring salad for lunch and felt unsatisfied. Snacked on chips all afternoon. Need to meal prep better.',
        type: 'text',
        dateOffset: -19,
      },
      {
        content:
          "Panic attack during grocery shopping. Started in the cereal aisle - suddenly felt like I couldn't breathe. Had to leave my cart and sit in the car for 20 minutes. Ordered takeout instead.",
        type: 'text',
        dateOffset: -17,
      },
      {
        content:
          'Called in sick today. Still shaken from yesterday. Spent most of the day on the couch watching Netflix. Ate leftover Chinese food. Feeling guilty but also just need to rest.',
        type: 'text',
        dateOffset: -16,
      },
      {
        content:
          'Back to work. Colleagues were understanding about yesterday. Had a good conversation with my manager about workload. Brought a homemade sandwich for lunch. Small steps.',
        type: 'text',
        dateOffset: -15,
      },
      {
        content:
          'Tried the new meditation app. 10 minutes felt like forever but I stuck with it. Had a proper dinner - grilled chicken with roasted vegetables. Proud of myself for cooking.',
        type: 'text',
        dateOffset: -13,
      },
      {
        content:
          "Date night with Alex. We went to that Italian place downtown. Shared a pizza and laughed a lot. Felt normal and happy for the first time in weeks. This is what I'm working toward.",
        type: 'text',
        dateOffset: -11,
      },
      {
        content:
          'Busy day at work but managed it well. Used the breathing techniques when I felt overwhelmed. Had a quinoa bowl for lunch. Energy stayed consistent throughout the day.',
        type: 'text',
        dateOffset: -9,
      },
      {
        content:
          "Mom called about Dad's test results. Not great news. Spent the evening crying and eating ice cream straight from the container. Sometimes life just sucks.",
        type: 'text',
        dateOffset: -7,
      },
      {
        content:
          "Drove to see my parents. Dad looks tired but he's fighting. We had dinner together - Mom made her famous lasagna. Family time felt healing despite everything.",
        type: 'text',
        dateOffset: -6,
      },
      {
        content:
          'Back home. Processing a lot of emotions about Dad. Therapy session was really helpful today. Made a simple stir-fry for dinner. Trying to maintain healthy habits even when stressed.',
        type: 'text',
        dateOffset: -4,
      },
      {
        content:
          'Good workout today - felt strong and capable. Had avocado toast for breakfast and a big salad for lunch. Energy levels are definitely improving with better sleep and exercise.',
        type: 'text',
        dateOffset: -3,
      },
      {
        content:
          'Weekend grocery shopping without any anxiety! Got ingredients for meal prep. Made a big batch of soup and quinoa bowls. Feeling organized and prepared for the week.',
        type: 'text',
        dateOffset: -2,
      },
      {
        content:
          "Reflecting on the past month. Still have hard days but I'm definitely stronger than when I started. Sleep is better, eating is more mindful, and I have tools for anxiety now. Progress isn't linear but it's happening.",
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
        content:
          'Starting a new eating plan today. Breakfast was oatmeal with blueberries and almonds. Lunch is planned - grilled chicken salad. Feeling motivated to make healthier choices.',
        type: 'text',
        dateOffset: -14,
      },
      {
        content:
          'Week 1 going well! Had Greek yogurt with granola for breakfast, quinoa bowl with vegetables for lunch. Made salmon with sweet potato for dinner. Lots of energy today.',
        type: 'text',
        dateOffset: -7,
      },
      {
        content:
          'Fell off the wagon yesterday. Had fast food - burger, fries, and a milkshake. Feeling sluggish and guilty today. Back to healthy eating with a green smoothie and salad.',
        type: 'text',
        dateOffset: -3,
      },
      {
        content:
          'Found a good balance now. Had eggs and whole grain toast for breakfast, turkey sandwich for lunch, and homemade pasta with vegetables for dinner. Feeling satisfied and energized.',
        type: 'text',
        dateOffset: -1,
      },
    ],
  },
  {
    name: 'mental-health-focused',
    description:
      'Mental health focused entries for testing mood and trigger analysis',
    entries: [
      {
        content:
          "Therapy session today was intense. We talked about childhood trauma and I felt really triggered. Came home and couldn't stop crying. Ordered comfort food - pizza and ice cream.",
        type: 'text',
        dateOffset: -10,
      },
      {
        content:
          'Better day today. Used the coping strategies from therapy when I felt anxious. Went for a walk instead of spiraling. Had a light lunch and felt accomplished.',
        type: 'text',
        dateOffset: -7,
      },
      {
        content:
          'Panic attack at work during the team meeting. Had to excuse myself and do breathing exercises in the bathroom. Felt embarrassed but proud that I handled it without leaving completely.',
        type: 'text',
        dateOffset: -4,
      },
      {
        content:
          "Great breakthrough in therapy! Finally understood a pattern I've been stuck in. Feeling hopeful and empowered. Celebrated with a nice dinner out with friends.",
        type: 'text',
        dateOffset: -1,
      },
    ],
  },
  {
    name: 'six-month-journey',
    description:
      'Six-month daily journal with realistic ups and downs (entries -180 to -1)',
    entries: [
      {
        content:
          "Started this six-month journal after a messy, exhausting stretch that left me feeling completely burned out. My therapist Dr. Chen suggested daily journaling to track patterns in my mood, energy, and eating habits. I'm honestly skeptical - I've tried this before and failed after a week - but I'm desperate enough to try anything. Had oatmeal with banana and almonds for breakfast (7/10 energy), but skipped lunch during back-to-back meetings and crashed around 3pm. Grabbed a coffee and protein bar to get through the day. Mood feels fragile, like I'm walking on eggshells with my own emotions. Sleep was terrible last night - maybe 4 hours of actual rest. Going to try the breathing exercises she taught me before bed tonight.",
        type: 'text',
        dateOffset: -180,
      },
      {
        content:
          "Woke up at 5:30am with a pounding headache behind my left eye - the kind that makes you nauseous. Definitely connected to stress and poor sleep (only got about 3.5 hours). Couldn't even think about working out, just threw on clothes and stumbled to the kitchen. Breakfast was two pieces of whole wheat toast with butter and black coffee - not exactly nutritious but it was all I could manage. Energy level felt like a 3/10 all morning. Had to cancel my 10am meeting because I couldn't focus on the screen without feeling dizzy. Mood is definitely anxious and irritable - snapped at my coworker Sarah over something trivial and felt guilty immediately. The headache finally started lifting around 2pm after I forced myself to drink more water and eat some leftover chicken salad. Need to prioritize sleep tonight.",
        type: 'text',
        dateOffset: -179,
      },
      {
        content:
          "Small victory today! Managed to get 6 hours of sleep and woke up without a headache. Made myself a proper breakfast - two-egg omelet with spinach, bell peppers, and a sprinkle of cheddar cheese. It felt good to actually cook something instead of just grabbing whatever was quickest. Energy started around 5/10 and stayed steady through the morning. During lunch break, instead of eating at my desk like usual, I took a 15-minute walk around the office park. The fresh air and movement made such a difference - came back feeling more alert and less tense in my shoulders. Had a turkey and avocado sandwich with some baby carrots. Mood is cautiously optimistic (6/10). Still feeling anxious about the project deadline next week, but not that overwhelming panic from yesterday. Maybe there's something to this whole self-care thing after all.",
        type: 'text',
        dateOffset: -178,
      },
      {
        content:
          "First full therapy session with Dr. Chen today. We dove deep into my anxiety patterns and work burnout. She asked me to rate my anxiety on a scale of 1-10 over the past month, and honestly, it's been hovering around 7-8 most days. We talked about how I've been using work as a way to avoid dealing with deeper issues, and how my perfectionism is actually making my performance worse, not better. She introduced me to the concept of 'catastrophic thinking' - apparently I do this constantly, always jumping to worst-case scenarios. Left feeling emotionally wrung out (mood 4/10) but also like someone finally understands what I've been going through. Had a grilled chicken Caesar salad for lunch before the appointment, which kept my energy stable. She gave me homework: identify three catastrophic thoughts this week and challenge them with evidence. Also supposed to practice box breathing for 5 minutes twice daily. Feels overwhelming but manageable.",
        type: 'text',
        dateOffset: -177,
      },
      {
        content:
          "Actually remembered to do the box breathing exercise Dr. Chen taught me! Did it for 10 minutes between my 11am and 12pm meetings. The timing was perfect because I'd just received a passive-aggressive email from my manager about missing a deadline (cue the anxiety spike to about 8/10). Instead of spiraling into catastrophic thinking like usual, I closed my office door and did the 4-4-4-4 breathing pattern. By minute 3, I could feel my heart rate slowing down. By minute 7, my shoulders weren't hunched up to my ears anymore. When I opened the email again after breathing, I could see it wasn't actually that bad - just a reminder about procedures, not a personal attack. Managed to respond professionally instead of defensively. Had leftover vegetable stir-fry with brown rice for lunch (6/10 energy). This breathing thing might actually work. Mood improved from 4/10 this morning to 6/10 by afternoon.",
        type: 'text',
        dateOffset: -176,
      },
      {
        content:
          'Overslept by 45 minutes and had to rush to get ready. Stress eating kicked in immediately - grabbed a chocolate glazed donut and large coffee on the way to work instead of the protein-rich breakfast I had planned. The sugar rush lasted maybe 30 minutes before I crashed hard around 10:30am. Energy dropped to a 3/10 and stayed there most of the day. By 2pm I was practically falling asleep at my desk, so I grabbed a protein bar and apple from the vending machine. That helped bring me back to maybe 5/10 energy. Mood was irritable and foggy all day (4/10). Had a moment of clarity around 4pm when I realized this cycle of poor sleep leading to poor food choices leading to energy crashes is exactly what Dr. Chen was talking about. Need to prioritize getting to bed earlier tonight - aiming for 10:30pm instead of my usual midnight scroll-fest.',
        type: 'text',
        dateOffset: -175,
      },
      {
        content:
          'Saturday morning ritual: tackle the chores that have been stressing me out all week. Spent 2 hours doing laundry, cleaning the kitchen, and organizing my disaster of a bedroom. There is something so therapeutic about creating order from chaos - my anxiety went from 7/10 this morning to about 4/10 by noon. Made a big batch of lentil soup with carrots, celery, onions, and a bay leaf. The whole apartment smells amazing and I feel accomplished. Meal prepping always makes me feel more in control of the week ahead. Had a bowl for lunch with some whole grain bread - satisfying and nourishing (energy 7/10). Mood is stable and content (7/10). This is what self-care actually looks like, not just face masks and bubble baths. Taking care of my environment takes care of my mental state.',
        type: 'text',
        dateOffset: -174,
      },
      {
        content:
          'Met Sam at our usual coffee spot after work - first time I have been social in weeks. I have been isolating when I feel anxious, but she texted to check in and I forced myself to say yes. We talked for two hours over lattes and shared a chocolate croissant. When she asked how I have been, I surprised myself by actually being honest instead of the usual "fine, just busy." Told her about starting therapy, the work stress, the sleep issues. Just saying it all out loud made the problems feel less overwhelming and more manageable. She shared some of her own anxiety strategies and reminded me that everyone struggles sometimes. By the end of our chat, my mood had lifted from 5/10 to 7/10. Energy actually increased rather than drained (6/10), which is unusual for social interactions lately. Walking home, I realized how much I had missed genuine human connection. Planning to be more intentional about maintaining friendships.',
        type: 'text',
        dateOffset: -173,
      },
      {
        content:
          'Monday hit like a freight train. Came back to 47 unread emails and three urgent project requests that apparently needed to be done "yesterday." Fell right back into old patterns - scarfed down a sad desk salad while frantically typing responses, completely forgot about the hourly movement breaks Dr. Chen recommended. By 3pm my shoulders were practically touching my ears and I had a tension headache building behind my eyes. Stress level peaked around 8/10 when my manager asked for a status update on something I had not even started yet. Realized around 4pm that I had been holding my breath for most of the day. Did some quick desk stretches and box breathing which helped bring the tension down to maybe 6/10. Had leftover lentil soup for dinner but barely tasted it while checking emails on my phone. This is exactly the kind of day that leads to burnout. Need to practice better boundaries tomorrow.',
        type: 'text',
        dateOffset: -172,
      },
      {
        content:
          'Decided to prioritize sleep recovery after yesterday disaster. Found a 20-minute gentle yoga video on YouTube - mostly stretches and breathing exercises focused on releasing tension. My body was so tight that even simple poses felt challenging, but by the end I could feel my nervous system starting to calm down. Mood shifted from anxious (6/10) to peaceful (7/10). Made chamomile tea and put my phone in the other room at 9:30pm - a full hour earlier than usual. Read a few pages of a novel instead of scrolling social media. Actually fell asleep by 10:15pm instead of tossing and turning until midnight. Woke up once around 2am but fell back asleep within 10 minutes. This is the first time in weeks that sleep felt restorative rather than just a break between stressful days. Energy this morning started at 6/10 instead of the usual 3/10. Small changes, big difference.',
        type: 'text',
        dateOffset: -171,
      },
      {
        content:
          'Meal-prepped quinoa bowls for the week. Feeling organized for once.',
        type: 'text',
        dateOffset: -170,
      },
      {
        content:
          'Sunday scaries crept in. Wrote three gratitudes before bed; helped a bit.',
        type: 'text',
        dateOffset: -169,
      },
      {
        content:
          'Presentation practice x2. Anxiety flickered, but repetition helped me steady.',
        type: 'text',
        dateOffset: -168,
      },
      {
        content:
          'Misunderstanding with my manager—heart raced. We cleared it up; relief and a lingering ache.',
        type: 'text',
        dateOffset: -167,
      },
      {
        content:
          'Walked at sunset and noticed the sky. Dinner was salmon and greens; felt nourished.',
        type: 'text',
        dateOffset: -166,
      },
      {
        content:
          'Therapy: boundaries at work. Homework is to say “no” at least once this week.',
        type: 'text',
        dateOffset: -165,
      },
      {
        content:
          'Rainy day slump. Napped after work and ordered Thai. Giving myself a pass.',
        type: 'text',
        dateOffset: -164,
      },
      {
        content:
          'Said “no” to an extra task. Relief mixed with guilt, but I stood my ground.',
        type: 'text',
        dateOffset: -163,
      },
      {
        content:
          'Knee felt sore after a jog. Iced and stretched while watching a show.',
        type: 'text',
        dateOffset: -162,
      },
      {
        content:
          'Rest day. Read half a novel and made pasta with veggies. Low-pressure evening.',
        type: 'text',
        dateOffset: -161,
      },
      {
        content:
          'Woke before the alarm and did a quick bodyweight workout. Focused well at work.',
        type: 'text',
        dateOffset: -160,
      },
      {
        content:
          'Call with Mom; Dad has a follow-up soon. Worry hums under the surface.',
        type: 'text',
        dateOffset: -159,
      },
      {
        content:
          'Ate mindlessly while scrolling and felt foggy after. Put snacks out of sight.',
        type: 'text',
        dateOffset: -158,
      },
      {
        content:
          'Mini panic wave in the grocery aisle; used counting technique; it passed.',
        type: 'text',
        dateOffset: -157,
      },
      {
        content:
          'Restocked real food and cooked turkey chili. Pride > shame today.',
        type: 'text',
        dateOffset: -156,
      },
      {
        content:
          'Coworker praised my draft. Shoulders dropped a little—kept the momentum.',
        type: 'text',
        dateOffset: -155,
      },
      {
        content:
          'Sugar crash after birthday cake in the break room. Water and a short walk helped.',
        type: 'text',
        dateOffset: -154,
      },
      {
        content:
          'Hydration day with a big bottle on my desk. Headache eased by afternoon.',
        type: 'text',
        dateOffset: -153,
      },
      {
        content:
          'Commute nightmare. Skipped the gym and took a hot shower instead.',
        type: 'text',
        dateOffset: -152,
      },
      {
        content:
          'Early bedtime goal met—8 hours for once. Morning felt kinder.',
        type: 'text',
        dateOffset: -151,
      },
      {
        content: 'Morning run along the river. Felt capable and clearheaded.',
        type: 'text',
        dateOffset: -150,
      },
      {
        content:
          'Tense team meeting. Practiced box breathing and didn’t spiral.',
        type: 'text',
        dateOffset: -149,
      },
      {
        content: 'Midday check-in journaling helped redirect the afternoon.',
        type: 'text',
        dateOffset: -148,
      },
      {
        content:
          'Planned simple dinners for the week. Grocery list felt very adult.',
        type: 'text',
        dateOffset: -147,
      },
      {
        content: 'Leftovers and a quiet TV night. Energy neutral; that’s okay.',
        type: 'text',
        dateOffset: -146,
      },
      {
        content:
          'Woke anxious; wrote “catastrophe vs. likely” and the fear softened.',
        type: 'text',
        dateOffset: -145,
      },
      {
        content:
          'Light stretch and tea before bed. Slept okay—no 3 a.m. spiral.',
        type: 'text',
        dateOffset: -144,
      },
      {
        content:
          'Deep cleaned the bedroom. Fresh sheets brought a tiny spark of joy.',
        type: 'text',
        dateOffset: -143,
      },
      {
        content:
          'Visited my cousin; laughed a lot. Social battery empty afterward.',
        type: 'text',
        dateOffset: -142,
      },
      {
        content:
          'Social hangover day. Gentle morning, soup for lunch, nap in the afternoon.',
        type: 'text',
        dateOffset: -141,
      },
      {
        content:
          'Twenty minutes of yoga; back felt looser and breath steadier.',
        type: 'text',
        dateOffset: -140,
      },
      {
        content: 'Bought supportive shoes. Knee happier on the evening walk.',
        type: 'text',
        dateOffset: -139,
      },
      {
        content:
          'Reviewed spending and made a budget. Stressful but also empowering.',
        type: 'text',
        dateOffset: -138,
      },
      {
        content: 'Packed lunch and skipped takeout. Energy stayed more even.',
        type: 'text',
        dateOffset: -137,
      },
      {
        content:
          'Migraine aura at noon; dim lights and hydration got me through.',
        type: 'text',
        dateOffset: -136,
      },
      {
        content:
          'Too much coffee led to jitters. Switched to half-caf after lunch.',
        type: 'text',
        dateOffset: -135,
      },
      {
        content:
          'Slow start with kinder self-talk. Oatmeal with berries for breakfast.',
        type: 'text',
        dateOffset: -134,
      },
      {
        content:
          'Call with Dad: heavy news but we connected. Took a walk afterward.',
        type: 'text',
        dateOffset: -133,
      },
      {
        content:
          'Therapy: big insight about overcommitment. Set weekend limits.',
        type: 'text',
        dateOffset: -132,
      },
      {
        content: 'Grocery store felt crowded; wore headphones; success.',
        type: 'text',
        dateOffset: -131,
      },
      {
        content:
          'Ran into an old friend; mixed feelings at first, then relief.',
        type: 'text',
        dateOffset: -130,
      },
      {
        content: 'Tried a new tofu stir-fry; surprisingly good and filling.',
        type: 'text',
        dateOffset: -129,
      },
      {
        content: 'Scratchy throat; tea, vitamin C, and an early bedtime.',
        type: 'text',
        dateOffset: -128,
      },
      {
        content:
          'Mild cold; canceled plans and watched movies. Guilt faded by evening.',
        type: 'text',
        dateOffset: -127,
      },
      {
        content:
          'Feeling better; short walk and appetite back. Simple soup for dinner.',
        type: 'text',
        dateOffset: -126,
      },
      {
        content:
          'Afternoon nap and decided not to shame myself for needing it.',
        type: 'text',
        dateOffset: -125,
      },
      {
        content: 'Volunteered at the community garden. Dirt therapy felt good.',
        type: 'text',
        dateOffset: -124,
      },
      {
        content: 'Put sticky notes with kind reminders on the mirror.',
        type: 'text',
        dateOffset: -123,
      },
      {
        content:
          'Prepped for a busy week and added calendar blocks. Feels protective.',
        type: 'text',
        dateOffset: -122,
      },
      {
        content:
          'Monday rush but I paced tasks and finished without staying late.',
        type: 'text',
        dateOffset: -121,
      },
      {
        content:
          'Tuesday team building event. Forced interaction felt draining, but dinner afterward was nice.',
        type: 'text',
        dateOffset: -120,
      },
      {
        content:
          'Worked from home and got loads done. Leftover soup and a quiet day.',
        type: 'text',
        dateOffset: -119,
      },
      {
        content:
          "Tried a new gym class - lots of burpees. Struggled but didn't quit.",
        type: 'text',
        dateOffset: -118,
      },
      {
        content:
          'Post-workout soreness. Epsom salt bath and gentle stretching.',
        type: 'text',
        dateOffset: -117,
      },
      {
        content:
          'Weekend farmers market run. Fresh vegetables and a good crowd mood.',
        type: 'text',
        dateOffset: -116,
      },
      {
        content:
          'Meal prep Sunday: roasted veggies, quinoa, and grilled chicken.',
        type: 'text',
        dateOffset: -115,
      },
      {
        content:
          'Anxious Sunday evening but caught it early. Deep breathing helped.',
        type: 'text',
        dateOffset: -114,
      },
      {
        content:
          'Productive Monday with clear priorities. Salmon and asparagus for dinner.',
        type: 'text',
        dateOffset: -113,
      },
      {
        content:
          'Mid-week slump hit hard. Ordered pizza and felt guilty after.',
        type: 'text',
        dateOffset: -112,
      },
      {
        content:
          'Back to healthy eating - Greek yogurt bowl with nuts and honey.',
        type: 'text',
        dateOffset: -111,
      },
      {
        content:
          'Therapy session focused on self-compassion. Homework: daily affirmations.',
        type: 'text',
        dateOffset: -110,
      },
      {
        content:
          'Date night with Alex - sushi and a movie. Felt connected and happy.',
        type: 'text',
        dateOffset: -109,
      },
      {
        content: 'Overcommitted to weekend plans. Learning to say no is hard.',
        type: 'text',
        dateOffset: -108,
      },
      {
        content:
          'Quiet Saturday: book, tea, and homemade soup. Exactly what I needed.',
        type: 'text',
        dateOffset: -107,
      },
      {
        content:
          'Sunday hike with friends. Nature therapy and good conversations.',
        type: 'text',
        dateOffset: -106,
      },
      {
        content: 'Work stress spike but used coping tools. Left on time.',
        type: 'text',
        dateOffset: -105,
      },
      {
        content:
          "Tried meditation app again - 15 minutes. Mind wandered but that's okay.",
        type: 'text',
        dateOffset: -104,
      },
      {
        content:
          'Energy crash after skipping lunch. Note: protein snacks in desk drawer.',
        type: 'text',
        dateOffset: -103,
      },
      {
        content:
          'Called my sister for her birthday. Long overdue catch-up felt good.',
        type: 'text',
        dateOffset: -102,
      },
      {
        content: 'Cooking experiment: Thai curry. Spicy but successful!',
        type: 'text',
        dateOffset: -101,
      },
      {
        content: 'Headache from screen time. Early bedtime and phone away.',
        type: 'text',
        dateOffset: -100,
      },
      {
        content:
          'Hit the three-month mark in this journaling experiment today. Looking back through my entries, the progress is fascinating and frustrating in equal measure. Some days I feel like I have made huge strides - better sleep habits, more mindful eating, actually using coping strategies when anxiety hits. Other days I feel like I am right back where I started, stress-eating pizza at midnight and spiraling into catastrophic thinking. Dr. Chen says this is totally normal, that healing is not a straight line but more like a spiral staircase. Today my mood is contemplative (6/10), energy steady (6/10). Had oatmeal with berries and nuts for breakfast, quinoa salad with grilled chicken for lunch. Did 15 minutes of meditation this morning without checking my phone first - that feels like a major victory. The anxiety is still there but it feels more manageable, like background noise instead of a fire alarm. I can see patterns now that I could not see before.',
        type: 'text',
        dateOffset: -99,
      },
      {
        content: 'Rainy day blues. Hot chocolate and a comfort movie marathon.',
        type: 'text',
        dateOffset: -98,
      },
      {
        content:
          'Sunshine returned! Morning walk before work lifted my spirits.',
        type: 'text',
        dateOffset: -97,
      },
      {
        content:
          'Team lunch at the new Mediterranean place. Tried hummus bowl.',
        type: 'text',
        dateOffset: -96,
      },
      {
        content:
          'Stayed late to finish project. Proud but exhausted. Pizza delivery.',
        type: 'text',
        dateOffset: -95,
      },
      {
        content:
          'Recovery day: gentle yoga and plenty of water. Listened to my body.',
        type: 'text',
        dateOffset: -94,
      },
      {
        content:
          "Weekend farmer's market haul. Trying new seasonal vegetables.",
        type: 'text',
        dateOffset: -93,
      },
      {
        content:
          'Experimental stir-fry with bok choy. Surprisingly tasty discovery.',
        type: 'text',
        dateOffset: -92,
      },
      {
        content:
          'Major test of my anxiety management tools today during the quarterly presentation to the executive team. About 5 minutes in, I felt the familiar panic rising - heart racing, palms sweating, that horrible feeling like I could not get enough air. In the past, I would have either powered through while internally falling apart or made an excuse to leave. Instead, I paused, took three deep breaths using the 4-7-8 technique Dr. Chen taught me, and continued. My voice was a bit shaky but I got through it. Afterwards, my manager Sarah pulled me aside to say the presentation was excellent and asked if I was feeling okay during that brief pause. When I explained about managing anxiety, she was incredibly supportive and shared that she deals with similar issues. Mood went from terror (2/10) to relief and pride (8/10). Energy crashed after from adrenaline dump (4/10). Had a protein smoothie and took a short walk to reset. This feels like a huge breakthrough.',
        type: 'text',
        dateOffset: -91,
      },
      {
        content:
          'Therapy debrief about yesterday. Tools worked even when scared.',
        type: 'text',
        dateOffset: -90,
      },
      {
        content:
          'Confidence building: small wins add up. Homemade salad success.',
        type: 'text',
        dateOffset: -89,
      },
      {
        content: 'Mom visit weekend. Family dinner chaos but lots of laughter.',
        type: 'text',
        dateOffset: -88,
      },
      {
        content:
          'Post-family emotional hangover. Journaling helps process everything.',
        type: 'text',
        dateOffset: -87,
      },
      {
        content:
          'First workout with Maya in over a month - I had been making excuses and avoiding the gym because everything felt overwhelming. She picked me up at 6am (no backing out!) and we did a full body strength training session. Having someone there made such a difference - she encouraged me through the hard parts and celebrated small victories like me actually completing all three sets of squats. Exercise has always felt like punishment when I am depressed, but today it felt empowering. My mood went from groggy and reluctant (4/10) to energized and proud (7/10). Energy peaked around 8/10 after workout endorphins kicked in. Had a protein smoothie with banana, spinach, and almond butter post-workout. Maya shared that she has been struggling with seasonal depression too, which made me feel less alone. We are planning to meet twice a week - accountability partnership in action.',
        type: 'text',
        dateOffset: -86,
      },
      {
        content: 'Sore muscles but good sore. Protein smoothie for recovery.',
        type: 'text',
        dateOffset: -85,
      },
      {
        content: 'Work deadline stress. Skipped gym but took walking meetings.',
        type: 'text',
        dateOffset: -84,
      },
      {
        content:
          'Project delivered successfully! Celebration dinner at favorite bistro.',
        type: 'text',
        dateOffset: -83,
      },
      {
        content: 'Post-project crash. Slept 10 hours and felt human again.',
        type: 'text',
        dateOffset: -82,
      },
      {
        content:
          'Gentle return to routine. Overnight oats and morning stretches.',
        type: 'text',
        dateOffset: -81,
      },
      {
        content:
          'Book club discussion got heated. Practiced staying calm in conflict.',
        type: 'text',
        dateOffset: -80,
      },
      {
        content:
          'Processed book club drama with therapist. Boundaries are self-care.',
        type: 'text',
        dateOffset: -79,
      },
      {
        content:
          'Trying intermittent fasting. Morning hunger pangs but mental clarity.',
        type: 'text',
        dateOffset: -78,
      },
      {
        content: 'Fasting day two: easier than expected. Green tea helps.',
        type: 'text',
        dateOffset: -77,
      },
      {
        content:
          'Weekend off fasting plan. Pizza night with friends was worth it.',
        type: 'text',
        dateOffset: -76,
      },
      {
        content:
          'Back to eating schedule. Energy more stable with regular meals.',
        type: 'text',
        dateOffset: -75,
      },
      {
        content:
          'Dentist appointment anxiety managed with breathing exercises.',
        type: 'text',
        dateOffset: -74,
      },
      {
        content: 'Clean bill of health at dentist! Reward: favorite smoothie.',
        type: 'text',
        dateOffset: -73,
      },
      {
        content:
          'Seasonal allergy flare-up. Antihistamines and reduced outdoor time.',
        type: 'text',
        dateOffset: -72,
      },
      {
        content: 'Allergies better. Spring walk appreciated after indoor days.',
        type: 'text',
        dateOffset: -71,
      },
      {
        content:
          'Cooking class with Alex. Pasta making was therapeutic and messy.',
        type: 'text',
        dateOffset: -70,
      },
      {
        content: 'Homemade pasta dinner. Skills improving, confidence growing.',
        type: 'text',
        dateOffset: -69,
      },
      {
        content:
          'Work conference call disaster. Tech issues but handled professionally.',
        type: 'text',
        dateOffset: -68,
      },
      {
        content:
          'Decompressed after work stress with long bath and herbal tea.',
        type: 'text',
        dateOffset: -67,
      },
      {
        content:
          'Four months of journaling. Patterns becoming clearer over time.',
        type: 'text',
        dateOffset: -66,
      },
      {
        content: 'Therapy session: recognizing triggers before they escalate.',
        type: 'text',
        dateOffset: -65,
      },
      {
        content:
          'Applied trigger awareness at difficult family dinner. Success!',
        type: 'text',
        dateOffset: -64,
      },
      {
        content:
          'Weekend hiking trip. Packed healthy snacks and felt energized.',
        type: 'text',
        dateOffset: -63,
      },
      {
        content: 'Muscle fatigue from hiking but mental clarity amazing.',
        type: 'text',
        dateOffset: -62,
      },
      {
        content: 'Recovery day: gentle movement and anti-inflammatory foods.',
        type: 'text',
        dateOffset: -61,
      },
      {
        content:
          'New coworker seems difficult. Practicing patience and boundaries.',
        type: 'text',
        dateOffset: -60,
      },
      {
        content:
          'Coworker situation improved with direct conversation. Relief.',
        type: 'text',
        dateOffset: -59,
      },
      {
        content:
          'Meal prep efficiency improving. Sunday batch cooking saves sanity.',
        type: 'text',
        dateOffset: -58,
      },
      {
        content: 'Busy week but prepared meals kept energy stable.',
        type: 'text',
        dateOffset: -57,
      },
      {
        content:
          "Friend's birthday party. Balanced socializing with self-care.",
        type: 'text',
        dateOffset: -56,
      },
      {
        content: 'Social battery drained. Quiet Sunday recharge with books.',
        type: 'text',
        dateOffset: -55,
      },
      {
        content:
          'Unexpected work crisis. Used stress management tools effectively.',
        type: 'text',
        dateOffset: -54,
      },
      {
        content: 'Crisis resolved. Team dinner celebration felt deserved.',
        type: 'text',
        dateOffset: -53,
      },
      {
        content:
          'The shorter days are definitely affecting my mood and energy levels. Past few weeks I have noticed the familiar signs of seasonal depression settling in - harder to get out of bed, craving carbs and sugar, feeling emotionally flat even when good things happen. Mood has been hovering around 4-5/10 most days, energy rarely gets above 5/10. Started taking 2000 IU vitamin D supplement daily and borrowed a light therapy lamp from my friend Maya. Using it for 30 minutes each morning while having coffee and checking emails. Too early to tell if it is helping but at least I am being proactive instead of just suffering through it like previous years. Food choices have been rough - lots of comfort eating with pasta, bread, and chocolate. Had mac and cheese for dinner again tonight but added some steamed broccoli to at least get some nutrients. Dr. Chen says to be gentle with myself during this transition and focus on harm reduction rather than perfection.',
        type: 'text',
        dateOffset: -52,
      },
      {
        content: 'Therapy adjustment for seasonal mood changes. Plan in place.',
        type: 'text',
        dateOffset: -51,
      },
      {
        content: 'Light therapy routine established. Morning brightness helps.',
        type: 'text',
        dateOffset: -50,
      },
      {
        content:
          'Energy lifting slightly. Homemade vegetable soup for comfort.',
        type: 'text',
        dateOffset: -49,
      },
      {
        content:
          'Gym session felt harder but completed anyway. Progress not perfection.',
        type: 'text',
        dateOffset: -48,
      },
      {
        content: 'Weekend plans cancelled due to exhaustion. Self-care wins.',
        type: 'text',
        dateOffset: -47,
      },
      {
        content: 'Gentle weekend: tea, reading, and early bedtimes.',
        type: 'text',
        dateOffset: -46,
      },
      {
        content: 'Energy returning gradually. Short morning walk felt good.',
        type: 'text',
        dateOffset: -45,
      },
      {
        content:
          'Therapy breakthrough about perfectionism. Homework: good enough practice.',
        type: 'text',
        dateOffset: -44,
      },
      {
        content:
          'Applied "good enough" to work project. Less stress, same result.',
        type: 'text',
        dateOffset: -43,
      },
      {
        content:
          'Five months of growth visible in these pages. Proud of progress.',
        type: 'text',
        dateOffset: -42,
      },
      {
        content:
          'Date night cooking disaster turned hilarious. Ordered pizza laughing.',
        type: 'text',
        dateOffset: -41,
      },
      {
        content: 'Laughter really is medicine. Mood lighter after fun evening.',
        type: 'text',
        dateOffset: -40,
      },
      {
        content: 'Work presentation went well. Confidence building steadily.',
        type: 'text',
        dateOffset: -39,
      },
      {
        content: 'Celebrated presentation success with nice dinner out.',
        type: 'text',
        dateOffset: -38,
      },
      {
        content:
          'Got the first guilt-trip text from my mother about holiday plans today, and I can already feel my stress levels spiking (7/10). Family dynamics during holidays have always been my biggest trigger - the expectations, the passive-aggressive comments, the old roles everyone slides back into. This year I am determined to do things differently. Spent an hour this evening making a specific plan with Dr. Chen strategies: set clear boundaries about how long I will stay, book my own accommodation instead of staying at my parents house, practice the gray rock technique with my critical aunt Linda, bring my own healthy snacks so I am not at the mercy of holiday sugar crashes. Also planning specific self-care for each day - morning walks, meditation, checking in with my support network. Energy today was decent (6/10) until the family stress hit, then dropped to 4/10. Made a nourishing dinner of roasted salmon with sweet potatoes and green beans. Practicing saying "That does not work for me" in the mirror feels silly but empowering.',
        type: 'text',
        dateOffset: -37,
      },
      {
        content: 'Family holiday planning call. Stayed calm despite drama.',
        type: 'text',
        dateOffset: -36,
      },
      {
        content:
          'Therapy session on holiday survival strategies. Feeling prepared.',
        type: 'text',
        dateOffset: -35,
      },
      {
        content:
          'Shopping for holiday gifts early. Avoiding last-minute stress.',
        type: 'text',
        dateOffset: -34,
      },
      {
        content:
          'Cooking experiment: holiday cookies. Kitchen disaster but fun.',
        type: 'text',
        dateOffset: -33,
      },
      {
        content: 'Cookie round two: success! Practice makes improvement.',
        type: 'text',
        dateOffset: -32,
      },
      {
        content:
          'Work year-end review preparation. Documenting growth and wins.',
        type: 'text',
        dateOffset: -31,
      },
      {
        content:
          'Review went excellently. Recognition for improved stress management.',
        type: 'text',
        dateOffset: -30,
      },
      {
        content:
          'Promotion discussion! All the self-work paying off professionally.',
        type: 'text',
        dateOffset: -29,
      },
      {
        content:
          'Celebrating potential promotion with friends. Grateful for support.',
        type: 'text',
        dateOffset: -28,
      },
      {
        content: 'Holiday travel anxiety managed with preparation and tools.',
        type: 'text',
        dateOffset: -27,
      },
      {
        content: 'Family visit surprisingly peaceful. Boundaries working well.',
        type: 'text',
        dateOffset: -26,
      },
      {
        content: 'Holiday meal cooking success. Confidence in kitchen growing.',
        type: 'text',
        dateOffset: -25,
      },
      {
        content: 'Family dynamics challenging but handled with new skills.',
        type: 'text',
        dateOffset: -24,
      },
      {
        content:
          'Post-holiday reflection: growth visible in family interactions.',
        type: 'text',
        dateOffset: -23,
      },
      {
        content:
          'New Year planning without pressure. Gentle goals and intentions.',
        type: 'text',
        dateOffset: -22,
      },
      {
        content:
          'Year-end journaling review. Transformation documented in these pages.',
        type: 'text',
        dateOffset: -21,
      },
      {
        content:
          'Therapy session on maintaining progress. Tools are now habits.',
        type: 'text',
        dateOffset: -20,
      },
      {
        content:
          'New Year energy applied to meal planning. Organization feels good.',
        type: 'text',
        dateOffset: -19,
      },
      {
        content:
          'Work resuming with confidence. Stress management now automatic.',
        type: 'text',
        dateOffset: -18,
      },
      {
        content:
          'Promotion officially confirmed! Hard work and healing both contributed.',
        type: 'text',
        dateOffset: -17,
      },
      {
        content:
          'Celebrating promotion with special dinner. Proud of the journey.',
        type: 'text',
        dateOffset: -16,
      },
      {
        content:
          'New responsibilities feeling manageable with current coping skills.',
        type: 'text',
        dateOffset: -15,
      },
      {
        content:
          'Mentoring new employee. Sharing stress management strategies.',
        type: 'text',
        dateOffset: -14,
      },
      {
        content:
          'Helping others helps consolidate my own learning. Full circle.',
        type: 'text',
        dateOffset: -13,
      },
      {
        content:
          'Six months of daily writing. Habit established, benefits clear.',
        type: 'text',
        dateOffset: -12,
      },
      {
        content:
          'Therapy graduation discussion. Tools internalized successfully.',
        type: 'text',
        dateOffset: -11,
      },
      {
        content:
          'Reduced therapy frequency to monthly check-ins. Ready for independence.',
        type: 'text',
        dateOffset: -10,
      },
      {
        content:
          'Cooking class graduation dinner. Skills and confidence both improved.',
        type: 'text',
        dateOffset: -9,
      },
      {
        content:
          'Weekend hiking challenge completed. Physical and mental strength aligned.',
        type: 'text',
        dateOffset: -8,
      },
      {
        content:
          'Work stress test passed with flying colors. Tools work under pressure.',
        type: 'text',
        dateOffset: -7,
      },
      {
        content:
          'Relationship with Alex deepening. Vulnerability without anxiety.',
        type: 'text',
        dateOffset: -6,
      },
      {
        content:
          'Family dinner invitation accepted confidently. Boundaries intact.',
        type: 'text',
        dateOffset: -5,
      },
      {
        content:
          'Meal planning for next week. Healthy choices feel natural now.',
        type: 'text',
        dateOffset: -4,
      },
      {
        content:
          'Morning meditation extending naturally. Inner peace more accessible.',
        type: 'text',
        dateOffset: -3,
      },
      {
        content:
          'Work presentation to executives. Calm competence felt amazing.',
        type: 'text',
        dateOffset: -2,
      },
      {
        content:
          'Today marks six months of daily journaling, and reading back through these entries feels like looking at a completely different person. The woman who started this journey was drowning in anxiety, running on empty, using work as an escape from her own mind. I still have anxiety - probably always will - but now I have tools to work with it instead of being overwhelmed by it. My relationship with food has transformed from mindless stress-eating to mostly mindful nourishment. Sleep is no longer something that happens to me but something I actively prioritize and protect. Most importantly, I have learned to be curious about my emotions rather than afraid of them. Today energy is strong and steady (8/10), mood is grateful and hopeful (9/10). Had my usual morning routine: meditation, protein-rich breakfast (Greek yogurt with berries and granola), vitamin D and light therapy. Work presentation went smoothly with no anxiety episodes. Dinner was homemade chicken stir-fry with lots of vegetables. The biggest change is not that I no longer have hard days, but that I trust myself to handle them. Dr. Chen was right - healing is not about becoming perfect, it is about becoming resilient.',
        type: 'text',
        dateOffset: -1,
      },
    ],
  },
];
