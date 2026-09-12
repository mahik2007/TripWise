import os
import re
from pathlib import Path
from dotenv import load_dotenv

# Load .env from the ai_chatbot directory regardless of where the server is run from
_env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=_env_path)


def get_rule_based_reply(user_message):
    msg = user_message.lower().strip()

    # Answer simple calculations locally when an optional AI key is unavailable.
    # This keeps the chat useful on a fresh local install.
    split_match = re.search(r"(?:split|divide|share).*?(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s+(?:among|between|by)\s+(\d+)", msg)
    if split_match:
        amount = float(split_match.group(1))
        people = int(split_match.group(2))
        if people > 0:
            share = amount / people
            return f"₹{amount:,.2f} split among {people} people is ₹{share:,.2f} per person. Add it as an expense in TripWise and the Summary page will calculate who owes whom."

    words = set(re.findall(r"[a-z]+", msg))
    if words.intersection({"hi", "hello", "hey", "namaste"}):
        return "👋 Hello! I'm TripWise AI. How can I help you organize or split expenses for your trip today? 🏖️"

    if words.intersection({"split", "divide", "share"}):
        return "💡 In TripWise, simply enter the Total Expense and list your group members! TripWise automatically splits it equally or with custom amounts and calculates who owes whom in the Summary page. 📊"

    if words.intersection({"budget", "tip", "save", "cheap"}):
        return "💰 Travel Budget Tip: Allocate 40% for accommodation, 30% for food & drinks, 20% for travel/transit, and 10% for emergencies & shopping! Track each expense in TripWise right after paying to avoid confusion later. ✈️"

    if words.intersection({"settle", "debt", "pay", "owe"}):
        return "🤝 To settle up, check the 'Summary' page! It provides the minimal number of transactions (e.g., 'Rahul owes Priya ₹500') so everyone pays fair and square without extra money transfers. 💸"

    if words.intersection({"currency", "rupee", "inr"}):
        return "🇮🇳 TripWise supports Indian Rupees (₹) by default. For international trips, convert payments to a single base currency before logging the amount! 🌍"

    return "I can help with trip budgets, shared expenses, equal splits, custom shares, and settlements. Try asking: ‘Split ₹1,200 among 3 people’ or ‘How should I budget for a trip?’"

def get_ai_response(user_message):
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key or api_key == "your_key_here":
        return get_rule_based_reply(user_message)


    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        system_prompt = (
            "You are TripWise AI, an upbeat and smart travel expense assistant built into the TripWise web application. "
            "Help travelers with expense splitting, trip budgeting, payment settlements, and smart money saving tips. "
            "Keep answers concise, clear, and friendly with emojis and calculations in INR (₹)."
        )
        full_prompt = f"{system_prompt}\n\nUser: {user_message}\nAssistant:"
        
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=full_prompt
        )
        return response.text
    except Exception as e:
        print(f"Gemini API error or missing key: {e}")
        return get_rule_based_reply(user_message)

if __name__ == "__main__":
    print("TripWise AI ready! Type 'exit' to quit.\n")
    while True:
        try:
            user_input = input("You: ")
            if user_input.lower() in ["exit", "quit"]:
                break
            reply = get_ai_response(user_input)
            print(f"AI: {reply}\n")
        except (KeyboardInterrupt, EOFError):
            break
