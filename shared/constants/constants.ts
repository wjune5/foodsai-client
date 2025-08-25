import { ChatRequestParams } from "@/shared/entities/chat";

export const welcomes = {
    "en": ["Your fridge looks a little lonely… Add your first yummy item!",
    "Let's fill your fridge with deliciousness! Tap 'Add Item' to get started.",
    "No snacks yet! Add something tasty to your collection.",
    "A happy fridge starts with your first item. Add one now!",
    "It's empty in here… let's add some foodie friends!",
    "Nothing here yet—be the first to stock up your smart fridge!",
    "Start your food adventure—add your first item now!",
    "No items, no fun! Hit 'Add Item' and let's get cooking.",
    "Your inventory is hungry for new items. Feed it!",
    "Ready to become a fridge master? Add your first item!"],
    "zh": ["您的冰箱看起来有点孤单… 添加您的第一个美味物品！",
        "让我们用美味填满您的冰箱！点击“添加物品”开始。",
        "还没有零食！添加一些美味的食物到您的收藏。",
        "一个快乐的冰箱从您的第一个物品开始。现在添加一个！",
        "这里有点空… 让我们添加一些美食朋友！",
        "Nothing here yet—be the first to stock up your smart fridge!",
        "Start your food adventure—add your first item now!",
        "No items, no fun! Hit 'Add Item' and let’s get cooking.",
        "Your inventory is hungry for new items. Feed it!",
        "Ready to become a fridge master? Add your first item!"] 
}

export const categories = {
    "en": ['vegetable', 'dairy', 'meat', 'fruit', 'grain', 'other'],
    "zh": ['蔬菜', '乳制品', '肉类', '水果', '谷物', '其他']
};
export const units = ['pcs', 'g', 'kg', 'ml', 'l', 'pack', 'box', 'other'];

export const aiProviders = {
    "OpenAI": {
        "model": [{
            name: "gpt-4o",
            input_token_limit: 1048576,
            output_token_limit: 65536
        }, {
            name: "gpt-4o-mini",
            input_token_limit: 1048576,
            output_token_limit: 65536
        }, {
            name: "gpt-3.5-turbo",
            input_token_limit: 1048576,
            output_token_limit: 65536
        }],
        "url": "https://api.openai.com/v1/chat/completions"
    },
    "Anthropic": {
        "model": [{
            name: "claude-3-5-sonnet-20240620",
            input_token_limit: 1048576,
            output_token_limit: 65536
        }, {
            name: "claude-3-5-sonnet-20240620-thinking",
            input_token_limit: 1048576,
            output_token_limit: 65536
        }, {
            name: "claude-3-5-sonnet-20240620-thinking-latest",
            input_token_limit: 1048576,
            output_token_limit: 65536
        }],
        "url": "https://api.anthropic.com/v1/messages"
    },
    "Google": {
        "model": [{
            name: "gemini-2.5-pro",
            input_token_limit: 1048576,
            output_token_limit: 65536
        }, {
            name: "gemini-2.5-flash",
            input_token_limit: 1048576,
            output_token_limit: 65536
        }, {
            name: "gemini-2.0-flash",
            input_token_limit: 1048576,
            output_token_limit: 658192
        }, {
            name: "gemini-2.0-flash-lite",
            input_token_limit: 1048576,
            output_token_limit: 8192
        }],
    }
}

export const defaultChatRequestParams: ChatRequestParams = {
    model: [],
    minExpirationDate: null,
    maxExpirationDate: null,
    minQuantity: null,
    maxQuantity: null,
    cookingTime: null,
    ingredients: [],
    nutrition: [],
    allergies: [],
    dietaryRestrictions: [],
    cuisine: [],
    mealType: [],
  };