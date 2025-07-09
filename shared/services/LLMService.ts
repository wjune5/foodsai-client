import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { GOOGLE_API_KEY } from "@/shared/constants/config";
import { PromptTemplate, FewShotChatMessagePromptTemplate, FewShotPromptTemplate } from "@langchain/core/prompts";
import { JsonOutputParser } from "@langchain/core/output_parsers";

export class LLMService {
    private model: ChatGoogleGenerativeAI;
    private examples: Array<{input: string, output: string}>;
    private example_prompt: PromptTemplate;
    private dynamic_prompt: FewShotPromptTemplate;

    constructor(apiKey?: string) {
        this.model = new ChatGoogleGenerativeAI({
            model: "gemini-2.0-flash",
            apiKey: GOOGLE_API_KEY,
            temperature: 0.5,
        });

        this.examples = [
            {input: "Banana", output: "Fruit"},
            {input: "Apple", output: "Fruit"},
            {input: "Carrot", output: "Vegetable"},
            {input: "Chicken", output: "Meat"},
            {input: "Milk", output: "Dairy"},
            {input: "Bread", output: "Grain"},
            {input: "Orange", output: "Fruit"},
        ];

        this.example_prompt = new PromptTemplate({
            inputVariables:["input", "output"],
            template:"{input} is a {output}"
        });

        this.dynamic_prompt = new FewShotPromptTemplate({
            examples: this.examples,
            examplePrompt: this.example_prompt,
            prefix: "Classify the following item into one of the following categories: Fruit, Vegetable, Meat, Dairy, Grain, or Other",
            suffix: "{noun} is a ",
            inputVariables: ["noun"],
        });
    }

    /**
     * Formats a prompt for food classification
     * @param noun - The food item to classify
     * @returns The formatted prompt string
     */
    async formatClassificationPrompt(noun: string): Promise<string> {
        return await this.dynamic_prompt.format({noun});
    }

    /**
     * Classifies a food item using the LLM
     * @param foodItem - The food item to classify
     * @returns Promise<string> - The classification result
     */
    async classifyFoodItem(foodItem: string): Promise<string> {
        try {
            // const prompt = await this.formatClassificationPrompt(foodItem);
            // const res = await this.dynamic_prompt.invoke({noun: foodItem});
            const chain = this.dynamic_prompt.pipe(this.model);
            const res = await chain.invoke({noun: foodItem});
            console.log(res);
            // const response = await this.model.invoke(prompt);
            // return String(res.toChatMessages());
            return String(res);
        } catch (error) {
            console.error('Error classifying food item:', error);
            throw new Error(`Failed to classify food item: ${error}`);
        }
    }

    /**
     * Gets the current examples used for classification
     * @returns Array of example objects
     */
    getExamples(): Array<{input: string, output: string}> {
        return [...this.examples];
    }

    /**
     * Adds a new example to the classification system
     * @param input - The input food item
     * @param output - The expected classification
     */
    addExample(input: string, output: string): void {
        this.examples.push({input, output});
        // Recreate the dynamic prompt with new examples
        this.dynamic_prompt = new FewShotPromptTemplate({
            examples: this.examples,
            examplePrompt: this.example_prompt,
            prefix: "Classify the following item into one of the following categories: Fruit, Vegetable, Meat, Dairy, Grain, or Other",
            suffix: "Classify the following item: {noun}",
            inputVariables: ["noun"],
        });
    }

    /**
     * Validates if a classification is valid
     * @param classification - The classification to validate
     * @returns boolean - Whether the classification is valid
     */
    isValidClassification(classification: string): boolean {
        const validCategories = ['Fruit', 'Vegetable', 'Meat', 'Dairy', 'Grain', 'Other'];
        return validCategories.some(category => 
            classification.toLowerCase().includes(category.toLowerCase())
        );
    }

    getJsonResponse(query: string, json_prompt:string, json_ouput_structure:string) {
        const parser = new JsonOutputParser();

        let format_instructions = parser.getFormatInstructions();
        format_instructions = `${json_prompt} json structure: ${json_ouput_structure}`;
        const prompt = new PromptTemplate({
            template: "{format_instructions}\nUser input:{input}",
            inputVariables: ["input"],
            partialVariables: {format_instructions},
        });
        const chain = prompt.pipe(this.model);
        return chain.invoke({input: query});
    }

        // const newParser = new OutputFixingParser().fromLLM(this.model, {
}

// Create a default instance for backward compatibility
export const llmService = new LLMService();
