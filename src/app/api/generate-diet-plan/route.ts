import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

interface DietPlanInput {
  name: string;
  age: number;
  weight: number;
  height: number;
  goal: 'weight_loss' | 'muscle_gain' | 'maintain' | 'health';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'high';
  allergies: string[];
  dislikedFoods: string[];
  healthConditions: string[];
  dietaryRestrictions: string[];
}

function calculateBMR(weight: number, height: number, age: number, gender: string = 'male'): number {
  if (gender === 'female') {
    return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }
  return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
}

function calculateTDEE(bmr: number, activityLevel: string): number {
  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    high: 1.725,
  };
  return Math.round(bmr * (multipliers[activityLevel] || 1.2));
}

function calculateTargetCalories(tdee: number, goal: string): number {
  switch (goal) {
    case 'weight_loss':
      return Math.round(tdee * 0.8);
    case 'muscle_gain':
      return Math.round(tdee * 1.15);
    case 'maintain':
    case 'health':
    default:
      return tdee;
  }
}

function generateMealOptions(
  targetCalories: number,
  goal: string,
  allergies: string[],
  dislikedFoods: string[],
  healthConditions: string[]
): any {
  const hasAcidity = healthConditions.some(c => 
    c.includes('حموضة') || c.includes('acidity') || c.includes('reflux')
  );
  const hasDiabetes = healthConditions.some(c => 
    c.includes('سكر') || c.includes('diabetes')
  );
  const hasHighPressure = healthConditions.some(c => 
    c.includes('ضغط') || c.includes('pressure') || c.includes('hypertension')
  );
  const hasCholesterol = healthConditions.some(c => 
    c.includes('كوليسترول') || c.includes('cholesterol')
  );

  const isDairyFree = allergies.some(a => 
    a.includes('ألبان') || a.includes('dairy') || a.includes('لبن') || a.includes('milk')
  );
  const isSeafoodFree = allergies.some(a => 
    a.includes('بحر') || a.includes('seafood') || a.includes('fish') || a.includes('سمك')
  );
  const isVegetarian = allergies.some(a => 
    a.includes('نباتي') || a.includes('vegetarian') || a.includes('لحم')
  );

  const breakfastCalories = Math.round(targetCalories * 0.25);
  const lunchCalories = Math.round(targetCalories * 0.35);
  const dinnerCalories = Math.round(targetCalories * 0.25);
  const snackCalories = Math.round(targetCalories * 0.15);

  const breakfastOptions = [];
  const morningSnackOptions = [];
  const lunchOptions = [];
  const eveningSnackOptions = [];
  const dinnerOptions = [];

  breakfastOptions.push({
    name: 'بيض مسلوق مع خبز أسمر',
    nameEn: 'Boiled Eggs with Whole Wheat Bread',
    description: 'بيضتان مسلوقتان + شريحة خبز أسمر + خضروات طازجة (خيار، طماطم)',
    descriptionEn: '2 boiled eggs + 1 slice whole wheat bread + fresh vegetables (cucumber, tomato)',
    calories: breakfastCalories,
    protein: 15,
    carbs: 25,
    fat: 10,
  });

  if (!isDairyFree) {
    breakfastOptions.push({
      name: 'زبادي مع بذور الشيا والفواكه',
      nameEn: 'Yogurt with Chia Seeds and Fruits',
      description: 'كوب زبادي يوناني + ملعقة بذور شيا + حفنة توت أو فراولة',
      descriptionEn: '1 cup Greek yogurt + 1 tbsp chia seeds + handful of berries',
      calories: breakfastCalories,
      protein: 18,
      carbs: 20,
      fat: 8,
    });
  }

  breakfastOptions.push({
    name: 'شوفان بالموز والعسل',
    nameEn: 'Oatmeal with Banana and Honey',
    description: 'نصف كوب شوفان مطبوخ + موزة مقطعة + ملعقة عسل + قرفة',
    descriptionEn: 'Half cup cooked oatmeal + 1 sliced banana + 1 tsp honey + cinnamon',
    calories: breakfastCalories,
    protein: 8,
    carbs: 45,
    fat: 5,
  });

  if (!hasDiabetes) {
    breakfastOptions.push({
      name: 'توست أفوكادو',
      nameEn: 'Avocado Toast',
      description: 'شريحتان توست أسمر + نصف أفوكادو مهروس + بيضة مسلوقة + رشة ملح وفلفل',
      descriptionEn: '2 whole wheat toast + half mashed avocado + 1 boiled egg + salt and pepper',
      calories: breakfastCalories,
      protein: 12,
      carbs: 30,
      fat: 15,
    });
  }

  morningSnackOptions.push({
    name: 'لوز مع تفاح',
    nameEn: 'Almonds with Apple',
    description: '10 حبات لوز + تفاحة متوسطة',
    descriptionEn: '10 almonds + 1 medium apple',
    calories: Math.round(snackCalories / 2),
    protein: 4,
    carbs: 20,
    fat: 8,
  });

  if (!isDairyFree) {
    morningSnackOptions.push({
      name: 'جبن قريش',
      nameEn: 'Cottage Cheese',
      description: '100 جرام جبن قريش قليل الملح',
      descriptionEn: '100g low-salt cottage cheese',
      calories: Math.round(snackCalories / 2),
      protein: 12,
      carbs: 3,
      fat: 4,
    });
  }

  morningSnackOptions.push({
    name: 'خضروات مقرمشة',
    nameEn: 'Crunchy Vegetables',
    description: 'جزر + خيار + فلفل ملون مقطع',
    descriptionEn: 'Carrot + cucumber + colored bell peppers (sliced)',
    calories: Math.round(snackCalories / 2),
    protein: 2,
    carbs: 10,
    fat: 0,
  });

  if (!isVegetarian) {
    lunchOptions.push({
      name: 'صدر دجاج مشوي مع الأرز البني',
      nameEn: 'Grilled Chicken Breast with Brown Rice',
      description: 'صدر دجاج مشوي (150 جم) + 4 ملاعق أرز بني + طبق سلطة خضراء كبير',
      descriptionEn: 'Grilled chicken breast (150g) + 4 tbsp brown rice + large green salad',
      calories: lunchCalories,
      protein: 35,
      carbs: 40,
      fat: 8,
    });
  }

  if (!isSeafoodFree && !isVegetarian) {
    lunchOptions.push({
      name: 'سمك مشوي مع خضار سوتيه',
      nameEn: 'Grilled Fish with Sautéed Vegetables',
      description: 'سمك مشوي (180 جم) + خضار سوتيه (كوسة، جزر، بروكلي) + ليمون',
      descriptionEn: 'Grilled fish (180g) + sautéed vegetables (zucchini, carrots, broccoli) + lemon',
      calories: lunchCalories,
      protein: 30,
      carbs: 15,
      fat: 12,
    });
  }

  lunchOptions.push({
    name: 'سلطة الكينوا بالخضروات',
    nameEn: 'Quinoa Vegetable Salad',
    description: 'كوب كينوا مطبوخة + خضروات مشكلة + زيت زيتون + ليمون',
    descriptionEn: '1 cup cooked quinoa + mixed vegetables + olive oil + lemon',
    calories: lunchCalories,
    protein: 12,
    carbs: 45,
    fat: 10,
  });

  if (!isVegetarian) {
    lunchOptions.push({
      name: 'لحم مشوي مع بطاطا مشوية',
      nameEn: 'Grilled Meat with Roasted Potatoes',
      description: 'لحم أحمر مشوي قليل الدهن (120 جم) + بطاطا مشوية (حبة متوسطة) + سلطة',
      descriptionEn: 'Lean grilled red meat (120g) + roasted potato (1 medium) + salad',
      calories: lunchCalories,
      protein: 28,
      carbs: 35,
      fat: 15,
    });
  }

  eveningSnackOptions.push({
    name: 'فشار بدون زيت',
    nameEn: 'Air-Popped Popcorn',
    description: 'كوبان فشار محضر بالهواء بدون زيت أو ملح زائد',
    descriptionEn: '2 cups air-popped popcorn without oil or excess salt',
    calories: Math.round(snackCalories / 2),
    protein: 2,
    carbs: 12,
    fat: 1,
  });

  eveningSnackOptions.push({
    name: 'مكسرات مشكلة',
    nameEn: 'Mixed Nuts',
    description: 'حفنة صغيرة مكسرات غير مملحة (جوز، لوز، بندق)',
    descriptionEn: 'Small handful of unsalted nuts (walnuts, almonds, hazelnuts)',
    calories: Math.round(snackCalories / 2),
    protein: 5,
    carbs: 6,
    fat: 14,
  });

  if (!isDairyFree) {
    eveningSnackOptions.push({
      name: 'كوب لبن رائب',
      nameEn: 'Buttermilk Cup',
      description: 'كوب لبن رائب قليل الدسم',
      descriptionEn: '1 cup low-fat buttermilk',
      calories: Math.round(snackCalories / 2),
      protein: 8,
      carbs: 12,
      fat: 2,
    });
  }

  if (!hasAcidity) {
    dinnerOptions.push({
      name: 'شوربة خضار',
      nameEn: 'Vegetable Soup',
      description: 'طبق كبير شوربة خضار (كوسة، جزر، بطاطس، سبانخ) + شريحة خبز',
      descriptionEn: 'Large bowl of vegetable soup (zucchini, carrots, potato, spinach) + bread slice',
      calories: dinnerCalories,
      protein: 8,
      carbs: 30,
      fat: 5,
    });
  }

  if (!isSeafoodFree && !isVegetarian) {
    dinnerOptions.push({
      name: 'تونة مع توست',
      nameEn: 'Tuna with Toast',
      description: 'علبة تونة مصفاة من الزيت + شريحتان توست رقيق + سلطة خضراء',
      descriptionEn: 'Drained tuna can + 2 thin toast slices + green salad',
      calories: dinnerCalories,
      protein: 25,
      carbs: 20,
      fat: 8,
    });
  }

  dinnerOptions.push({
    name: 'سلطة مع بروتين نباتي',
    nameEn: 'Salad with Plant Protein',
    description: 'سلطة خضراء كبيرة + حمص أو فول + زيت زيتون',
    descriptionEn: 'Large green salad + chickpeas or fava beans + olive oil',
    calories: dinnerCalories,
    protein: 12,
    carbs: 25,
    fat: 10,
  });

  if (!isVegetarian) {
    dinnerOptions.push({
      name: 'بيض أومليت بالخضار',
      nameEn: 'Vegetable Omelette',
      description: 'أومليت من بيضتين مع خضروات (فلفل، طماطم، سبانخ)',
      descriptionEn: '2-egg omelette with vegetables (bell pepper, tomato, spinach)',
      calories: dinnerCalories,
      protein: 14,
      carbs: 8,
      fat: 12,
    });
  }

  return {
    breakfast: breakfastOptions,
    morningSnack: morningSnackOptions,
    lunch: lunchOptions,
    eveningSnack: eveningSnackOptions,
    dinner: dinnerOptions,
  };
}

function generateBeverages(healthConditions: string[]): any {
  const hasDiabetes = healthConditions.some(c => 
    c.includes('سكر') || c.includes('diabetes')
  );
  const hasHighPressure = healthConditions.some(c => 
    c.includes('ضغط') || c.includes('pressure')
  );

  return {
    waterRecommendation: '2.5 - 3 لترات يومياً',
    waterRecommendationEn: '2.5 - 3 liters daily',
    allowed: [
      {
        name: 'شاي أخضر',
        nameEn: 'Green Tea',
        quantity: '2-3 أكواب يومياً',
        quantityEn: '2-3 cups daily',
      },
      {
        name: 'قهوة سوداء',
        nameEn: 'Black Coffee',
        quantity: hasHighPressure ? 'كوب واحد فقط' : '2 أكواب كحد أقصى',
        quantityEn: hasHighPressure ? 'Only 1 cup' : 'Maximum 2 cups',
      },
      {
        name: 'أعشاب (نعناع، يانسون، بابونج)',
        nameEn: 'Herbal teas (mint, anise, chamomile)',
        quantity: 'بدون قيود',
        quantityEn: 'No limits',
      },
      {
        name: 'ماء بالليمون',
        nameEn: 'Lemon Water',
        quantity: 'كوب صباحاً على الريق',
        quantityEn: '1 cup in the morning on empty stomach',
      },
    ],
    forbidden: [
      {
        name: 'المشروبات الغازية',
        nameEn: 'Soft drinks',
      },
      {
        name: 'العصائر المحلاة',
        nameEn: 'Sweetened juices',
      },
      {
        name: 'مشروبات الطاقة',
        nameEn: 'Energy drinks',
      },
      ...(hasDiabetes ? [{
        name: 'العصائر الطبيعية بكميات كبيرة',
        nameEn: 'Natural juices in large quantities',
      }] : []),
    ],
  };
}

function generateSupplements(goal: string, healthConditions: string[]): any {
  const supplements = [];

  supplements.push({
    name: 'فيتامين D',
    nameEn: 'Vitamin D',
    dosage: '1000-2000 وحدة دولية يومياً',
    dosageEn: '1000-2000 IU daily',
    timing: 'مع وجبة تحتوي على دهون',
    timingEn: 'With a meal containing fats',
    note: 'بعد فحص مستوى الفيتامين في الدم',
    noteEn: 'After checking blood vitamin levels',
  });

  supplements.push({
    name: 'أوميغا 3',
    nameEn: 'Omega 3',
    dosage: '1000 ملجم يومياً',
    dosageEn: '1000mg daily',
    timing: 'مع وجبة الغداء',
    timingEn: 'With lunch',
    note: 'مفيد للقلب والمفاصل',
    noteEn: 'Good for heart and joints',
  });

  if (goal === 'weight_loss' || goal === 'muscle_gain') {
    supplements.push({
      name: 'فيتامين B12',
      nameEn: 'Vitamin B12',
      dosage: '500-1000 ميكروجرام',
      dosageEn: '500-1000 mcg',
      timing: 'صباحاً مع الفطور',
      timingEn: 'Morning with breakfast',
      note: 'يساعد على الطاقة والأيض',
      noteEn: 'Helps with energy and metabolism',
    });
  }

  return {
    recommended: supplements,
    disclaimer: 'يجب استشارة الطبيب قبل تناول أي مكملات غذائية',
    disclaimerEn: 'Consult a doctor before taking any supplements',
  };
}

function generateGuidelines(healthConditions: string[]): any {
  const hasAcidity = healthConditions.some(c => 
    c.includes('حموضة') || c.includes('acidity')
  );

  const guidelines = [
    {
      category: 'طرق الطهي',
      categoryEn: 'Cooking Methods',
      tips: [
        'الشوي في الفرن أو على الجريل',
        'السلق والطهي بالبخار',
        'استخدام زيت الزيتون بدلاً من الزيوت النباتية',
        'تجنب القلي العميق',
      ],
      tipsEn: [
        'Oven baking or grilling',
        'Boiling and steaming',
        'Use olive oil instead of vegetable oils',
        'Avoid deep frying',
      ],
    },
    {
      category: 'تنظيم الوجبات',
      categoryEn: 'Meal Timing',
      tips: [
        'فاصل 3-4 ساعات بين الوجبات',
        'التوقف عن الأكل قبل النوم بساعتين',
        'تناول الفطور خلال ساعة من الاستيقاظ',
        'عدم تخطي الوجبات الرئيسية',
      ],
      tipsEn: [
        '3-4 hours gap between meals',
        'Stop eating 2 hours before sleep',
        'Have breakfast within 1 hour of waking',
        'Do not skip main meals',
      ],
    },
    {
      category: 'الأكل الواعي',
      categoryEn: 'Mindful Eating',
      tips: [
        'مضغ الطعام جيداً (20-30 مرة)',
        'تناول الطعام ببطء',
        'تجنب الأكل أثناء مشاهدة التلفاز',
        'الجلوس على الطاولة أثناء الأكل',
      ],
      tipsEn: [
        'Chew food well (20-30 times)',
        'Eat slowly',
        'Avoid eating while watching TV',
        'Sit at the table while eating',
      ],
    },
  ];

  if (hasAcidity) {
    guidelines.push({
      category: 'نصائح للحموضة',
      categoryEn: 'Tips for Acidity',
      tips: [
        'تجنب الأطعمة الحارة والتوابل',
        'تجنب الحمضيات على معدة فارغة',
        'رفع الرأس قليلاً أثناء النوم',
        'تجنب الاستلقاء مباشرة بعد الأكل',
      ],
      tipsEn: [
        'Avoid spicy foods and spices',
        'Avoid citrus on empty stomach',
        'Elevate head slightly during sleep',
        'Avoid lying down immediately after eating',
      ],
    });
  }

  return guidelines;
}

function generateAlternatives(): any {
  return {
    protein: [
      { original: 'صدر دجاج', originalEn: 'Chicken breast', alternatives: ['سمك', 'ديك رومي', 'لحم أحمر قليل الدهن'], alternativesEn: ['Fish', 'Turkey', 'Lean red meat'] },
      { original: 'بيض', originalEn: 'Eggs', alternatives: ['جبن قريش', 'توفو', 'فول'], alternativesEn: ['Cottage cheese', 'Tofu', 'Fava beans'] },
    ],
    carbs: [
      { original: 'أرز أبيض', originalEn: 'White rice', alternatives: ['أرز بني', 'كينوا', 'بطاطا مشوية', 'برغل'], alternativesEn: ['Brown rice', 'Quinoa', 'Baked potato', 'Bulgur'] },
      { original: 'خبز أبيض', originalEn: 'White bread', alternatives: ['خبز أسمر', 'خبز شوفان', 'توست كامل الحبوب'], alternativesEn: ['Whole wheat bread', 'Oat bread', 'Whole grain toast'] },
    ],
    fats: [
      { original: 'زيت نباتي', originalEn: 'Vegetable oil', alternatives: ['زيت زيتون', 'زيت جوز الهند', 'زيت الأفوكادو'], alternativesEn: ['Olive oil', 'Coconut oil', 'Avocado oil'] },
    ],
  };
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ 
        success: false,
        error: 'Authentication required' 
      }, { status: 401 });
    }

    const body: DietPlanInput = await request.json();
    const {
      name,
      age,
      weight,
      height,
      goal,
      activityLevel,
      allergies = [],
      dislikedFoods = [],
      healthConditions = [],
      dietaryRestrictions = [],
    } = body;

    if (!name || !age || !weight || !height || !goal || !activityLevel) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        code: 'MISSING_FIELDS',
      }, { status: 400 });
    }

    const bmr = calculateBMR(weight, height, age);
    const tdee = calculateTDEE(bmr, activityLevel);
    const targetCalories = calculateTargetCalories(tdee, goal);

    const bmi = weight / Math.pow(height / 100, 2);

    const combinedRestrictions = [...allergies, ...dietaryRestrictions];
    const mealOptions = generateMealOptions(targetCalories, goal, combinedRestrictions, dislikedFoods, healthConditions);
    const beverages = generateBeverages(healthConditions);
    const supplements = generateSupplements(goal, healthConditions);
    const guidelines = generateGuidelines(healthConditions);
    const alternatives = generateAlternatives();

    const goalLabels: Record<string, { ar: string; en: string }> = {
      weight_loss: { ar: 'إنقاص الوزن', en: 'Weight Loss' },
      muscle_gain: { ar: 'زيادة العضلات', en: 'Muscle Gain' },
      maintain: { ar: 'تثبيت الوزن', en: 'Weight Maintenance' },
      health: { ar: 'صحة عامة', en: 'General Health' },
    };

    const activityLabels: Record<string, { ar: string; en: string }> = {
      sedentary: { ar: 'خامل (بدون نشاط)', en: 'Sedentary' },
      light: { ar: 'نشاط قليل', en: 'Light Activity' },
      moderate: { ar: 'نشاط متوسط', en: 'Moderate Activity' },
      high: { ar: 'نشاط مرتفع', en: 'High Activity' },
    };

    const dietPlan = {
      patientInfo: {
        name,
        age,
        weight,
        height,
        bmi: Math.round(bmi * 100) / 100,
        goal: goalLabels[goal],
        activityLevel: activityLabels[activityLevel],
      },
      calculations: {
        bmr: Math.round(bmr),
        tdee,
        targetCalories,
        macros: {
          protein: Math.round(targetCalories * 0.25 / 4),
          carbs: Math.round(targetCalories * 0.45 / 4),
          fat: Math.round(targetCalories * 0.30 / 9),
        },
      },
      mealPlan: mealOptions,
      beverages,
      supplements,
      guidelines,
      alternatives,
      restrictions: {
        allergies,
        dislikedFoods,
        healthConditions,
        dietaryRestrictions,
      },
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: dietPlan,
    });

  } catch (error) {
    console.error('Generate diet plan error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate diet plan: ' + (error as Error).message,
    }, { status: 500 });
  }
}
