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
export const predictExpenses = async (req, res) => {
    try {
        // 1. Fetch historical data for this user
        const expenses = await expenseModel.find({ user: req.user._id }).sort({ date: 1 });
        
        if (expenses.length < 5) {
            return res.status(200).json({ 
                prediction: null, 
                message: "Insufficient data for prediction. Keep tracking for a few more weeks!",
                isFallback: true
            });
        }

        // 2. Aggregate monthly spend for ML input
        const monthlyAgg = expenses.reduce((acc, curr) => {
            const d = new Date(curr.date);
            const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
            if (curr.type === 'expense') acc[key] = (acc[key] || 0) + curr.amount;
            return acc;
        }, {});

        const history = Object.values(monthlyAgg);

        // 3. Call Python ML Service (FastAPI)
        // Note: In production, ML_SERVICE_URL would be an env var
        const mlUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000/predict';
        
        try {
            const response = await fetch(mlUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ history, income: req.body.monthlyIncome || 0 })
            });

            if (!response.ok) throw new Error("ML Service connection failed");
            
            const result = await response.json();
            res.status(200).json({
                prediction: result.prediction,
                savings: result.predicted_savings,
                recommendation: result.recommendation,
                isFallback: false
            });
        } catch (mlErr) {
            console.error("ML Service Error:", mlErr);
            // Fallback to a simple 3-month average if ML service is down
            const avg = history.slice(-3).reduce((a, b) => a + b, 0) / Math.min(history.length, 3);
            res.status(200).json({
                prediction: avg * 1.05, // simple buffer
                message: "Using statistical fallback (ML service busy)",
                isFallback: true
            });
        }

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
