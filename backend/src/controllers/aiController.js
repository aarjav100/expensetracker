import Anthropic from '@anthropic-ai/sdk';
import expenseModel from '../model/expenseModel.js';
import { awardPoints } from '../utils/gamification.js';

export const generateBudgetPlan = async (req, res) => {
    try {
        const { monthlyIncome } = req.body;
        
        // Ensure Anthropic API Key is available
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: "Anthropic API key is not configured in .env." });
        }

        const anthropic = new Anthropic({ apiKey });

        // Fetch last 3 months of expenses
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const expenses = await expenseModel.find({
            user: req.user._id,
            date: { $gte: threeMonthsAgo }
        }).select('title amount category date type');

        // Analyze and group by category
        const summary = expenses.reduce((acc, curr) => {
            if (curr.type === 'expense') {
                acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
            }
            return acc;
        }, {});

        const promptText = `I am a user with a monthly income of ${monthlyIncome}. Here is a summary of my spending over the last 3 months by category: ${JSON.stringify(summary)}. 
        Calculate my average monthly spending per category.
        Then, generate a personalized monthly budget for me. Explain reasoning, suggest areas to cut, and provide 3 output presets: Frugal, Balanced, and Comfortable. 
        Please return ONLY a valid JSON object (no markdown formatting, no comments) with the following structure:
        {
          "analysis": "string explaining reasoning and overspending",
          "suggestions": ["suggestion 1", "suggestion 2"],
          "presets": {
            "frugal": { "Total": amount, "Food": amount, "Transport": amount, "etc": amount },
            "balanced": { "Total": amount, "Food": amount, "Transport": amount, "etc": amount },
            "comfortable": { "Total": amount, "Food": amount, "Transport": amount, "etc": amount }
          }
        }`;

        const msg = await anthropic.messages.create({
            model: "claude-3-haiku-20240307",
            max_tokens: 1500,
            messages: [{ role: "user", content: promptText }]
        });

        // Try to parse the response
        let aiResponse;
        try {
            aiResponse = JSON.parse(msg.content[0].text);
        } catch(e) {
            // Failsafe in case Claude returned markdown or text outside JSON
            const jsonMatch = msg.content[0].text.match(/\{[\s\S]*\}/);
            if(jsonMatch) {
                aiResponse = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error("Failed to parse AI response into JSON.");
            }
        }

        // Award Gamification Points for using AI
        await awardPoints(req.user._id, 'earned', 20, 'Utilized the AI Budget Generator');

        res.status(200).json({
            message: "AI Budget generated successfully",
            data: aiResponse
        });

    } catch(err) {
        console.error('Claude API Error:', err);
        res.status(500).json({ error: err.message });
    }
};
