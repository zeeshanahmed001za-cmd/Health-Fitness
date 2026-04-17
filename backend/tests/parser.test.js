import { parseWithRules } from '../src/services/parserService.js';

describe('parserService - parseWithRules', () => {
    describe('Water Detection', () => {
        it('should parse water with "glass" unit and default to 250ml per glass', () => {
            const result = parseWithRules('I drank 2 glasses of water');
            expect(result).toEqual({ activityType: 'water', data: { amount: 500, name: 'Water' } });
        });

        it('should parse water with "l" unit and convert to ml', () => {
             const result = parseWithRules('drank 1.5 l water');
             expect(result).toEqual({ activityType: 'water', data: { amount: 1500, name: 'Water' } });
        });

        it('should parse water implicitly if amount is < 5 and convert to ml', () => {
             const result = parseWithRules('had 3 water');
             expect(result).toEqual({ activityType: 'water', data: { amount: 750, name: 'Water' } });
        });

        it('should parse water without units when > 5 directly as ml', () => {
             const result = parseWithRules('drank 500 water');
             expect(result).toEqual({ activityType: 'water', data: { amount: 500, name: 'Water' } });
        });
        
        it('should parse water in oz and convert to ml', () => {
             const result = parseWithRules('drank 10 oz water');
             // 10 * 29.57 = 295.7 => 296
             expect(result).toEqual({ activityType: 'water', data: { amount: 296, name: 'Water' } });
        });
    });

    describe('Weight Detection', () => {
        it('should parse weight in kg without conversion', () => {
            const result = parseWithRules('scaled 70 kg');
            expect(result).toEqual({ activityType: 'weight', data: { weight: 70 } });
        });

        it('should parse weight in lbs and convert to kg', () => {
            const result = parseWithRules('weighed 150 lbs');
            // 150 * 0.453592 = 68.0388 => 68
            expect(result).toEqual({ activityType: 'weight', data: { weight: 68 } });
        });

        it('should parse weight in pounds and convert to kg', () => {
            const result = parseWithRules('weight 200 pounds');
            // 200 * 0.453592 = 90.7184 => 90.7
            expect(result).toEqual({ activityType: 'weight', data: { weight: 90.7 } });
        });

        it('should parse weight without unit implicitly as kg', () => {
            const result = parseWithRules('weight 80');
            expect(result).toEqual({ activityType: 'weight', data: { weight: 80 } });
        });
    });

    describe('Workout Detection', () => {
        it('should parse a cardio workout in minutes', () => {
            const result = parseWithRules('ran for 30 minutes');
            expect(result).toEqual({
                activityType: 'workout',
                data: { type: 'Cardio', duration: 30, name: 'ran', caloriesBurned: 210 }
            });
        });

        it('should parse a strength workout in hours', () => {
            const result = parseWithRules('gym for 1 hour');
            expect(result).toEqual({
                activityType: 'workout',
                data: { type: 'Strength', duration: 60, name: 'gym', caloriesBurned: 420 }
            });
        });

        it('should parse other workouts and default name/type appropriately', () => {
            const result = parseWithRules('30 min training');
            expect(result).toEqual({
                activityType: 'workout',
                data: { type: 'Other', duration: 30, name: 'training', caloriesBurned: 210 }
            });
        });

        it('should fallback to Exercise name if name empty', () => {
            // this regex replaces numbers and keywords, if it's completely empty -> Exercise
            const result = parseWithRules('workout for 30 mins');
            expect(result).toEqual({
                activityType: 'workout',
                data: { type: 'Other', duration: 30, name: 'Exercise', caloriesBurned: 210 }
            });
        });
    });

    describe('Food Detection', () => {
        it('should parse simple food with explicit calories', () => {
            const result = parseWithRules('ate 500 calories apple');
            expect(result).toEqual({
                activityType: 'food',
                data: {
                    name: 'apple',
                    calories: 500,
                    protein: 30, // 500 * 0.06
                    carbs: 55,   // 500 * 0.11
                    fat: 18      // 500 * 0.035 => 17.5 => 18
                }
            });
        });
        
        it('should default to Meal if name is not found', () => {
            const result = parseWithRules('had 300 kcal');
            expect(result).toEqual({
                activityType: 'food',
                data: {
                    name: 'Meal',
                    calories: 300,
                    protein: 18,
                    carbs: 33,
                    fat: 11
                }
            });
        });
    });

    describe('No Match', () => {
        it('should return null for unmatched inputs', () => {
            const result = parseWithRules('hello world');
            expect(result).toBeNull();
        });
    });
});
