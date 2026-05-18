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
