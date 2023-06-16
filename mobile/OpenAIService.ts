/** This file defines a functional interface to the OpenAI service. */
import { Configuration, OpenAIApi } from 'openai'
import { FaqModel } from './Models'

interface ActivityFaqCompletionRequest {
  // Name of the activity, or proxy such as a placeholder.
  name: string
}

export default class OpenAIService {

  static get(apiKey: string): OpenAIService {
    return new OpenAIService(apiKey)
  }

  private config_: Configuration
  private api_: OpenAIApi

  private constructor(apiKey: string) {
    this.config_ = new Configuration({ apiKey: apiKey })
    this.api_ = new OpenAIApi(this.config_)
  }

  async completeActivityFaq(req: ActivityFaqCompletionRequest): Promise<FaqModel> {
    const context = `You provide "${req.name}" as an activity session to prospective clients.`
    const query = `What are the top 10 questions about the session that prospective clients may have in order to better understand, disambiguate or clarify the details and nature of the session? For each question, what are the top 5 applicable discrete answers or ranges of values? Do not include questions related to location, duration or schedule.`
    const starter = `{"Questions": [{"Topic": "Sample","Question": "This is a sample question. What are the options?","Answers": ["A","B","C","D","E"]},{"Topic": "`
    const prompt = `${context}\n\n${query}\n\njson=${starter}`
    return this.api_.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      max_tokens: 1024,
    }).then((response) => {
      const jsonStr = `{"Questions": [{"Topic": "${response.data!.choices[0]!.text}`
      return JSON.parse(jsonStr)
    })
  }
}